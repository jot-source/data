# Supabase Auth — Server Action Error Handling Pattern

Context for AI assistants: this project uses Next.js server actions calling
Supabase Auth (`@supabase/supabase-js`). This doc defines the required
error-handling pattern for every auth-related server action.

## Why this exists

Supabase auth errors come in two shapes:

1. **Resolved errors** — `const { data, error } = await supabase.auth.X(...)`.
   `error.message` / `error.status` / `error.code` are usually populated.
2. **Thrown errors** — network-level failures (DNS, timeout, connection
   refused, SMTP provider rejecting the request) can throw instead of
   resolving. If not caught, this becomes an unhandled rejection with **no
   log at all**.

Additionally, `AuthRetryableFetchError` frequently resolves with an **empty
top-level `message` (e.g. `"{}"`)** — the real reason (SMTP rate limit,
provider outage, etc.) lives one level deeper in `error.cause`, which is
easy to miss if you only log `name/status/code/message`.

**Rule: never log or return just `error.message` — always inspect and log
`error.cause` too, and always wrap the call in try/catch.**

## Standard pattern

```ts
export async function someAuthAction(...) {
  const parsed = someSchema.safeParse({...})
  if (!parsed.success) {
    logger.warn({ issues: parsed.error.issues }, 'auth.actions: someAuthAction validation failed')
    return { error: parsed.error.issues[0].message }
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let data, error
  try {
    ;({ data, error } = await supabase.auth.someMethod(parsed.data))
  } catch (thrown) {
    // Network-level failures can throw rather than resolve with { error }.
    const err = thrown as Error & { cause?: unknown }
    logger.error(
      {
        name: err?.name,
        message: err?.message,
        cause: err?.cause instanceof Error
          ? { name: err.cause.name, message: err.cause.message }
          : err?.cause,
        stack: err?.stack,
      },
      'auth.actions: someAuthAction threw before returning'
    )
    return { error: 'Could not reach the auth service. Please try again in a moment.' }
  }

  if (error) {
    const cause = (error as { cause?: unknown }).cause
    logger.error(
      {
        name: error.name,
        status: error.status,
        code: error.code,
        message: error.message || null,
        cause:
          cause instanceof Error
            ? { name: cause.name, message: cause.message, stack: cause.stack }
            : cause ?? null,
      },
      'auth.actions: someAuthAction failed'
    )

    // Give specific messages per known error type instead of one generic fallback.
    if (error.name === 'AuthRetryableFetchError') {
      return {
        error:
          'Email service is temporarily unavailable (this can happen if you just requested a code — please wait a bit and try again).',
      }
    }

    return { error: error.message || 'Something went wrong. Please try again.' }
  }

  // success path...
  return { success: true }
}
```

## Checklist for every Supabase auth action

- [ ] `safeParse` with Zod before touching Supabase (never trust client payloads)
- [ ] `try/catch` around the `supabase.auth.X(...)` call itself
- [ ] Catch block logs `name`, `message`, `cause`, `stack` — not just `message`
- [ ] `if (error)` block logs `name`, `status`, `code`, `message`, and `cause`
      (cause unwrapped if it's an `Error` instance)
- [ ] Known error types (`AuthRetryableFetchError`, rate-limit errors, etc.)
      get a specific, actionable user-facing message — not the raw Supabase
      message and not a single generic fallback for everything
- [ ] Never log full passwords, tokens, or OTP codes — email/userId only
- [ ] Return shape stays `{ error: string }` or `{ success: true, ...data }`
      consistently across all actions, so calling components don't need
      type gymnastics

## Known error types seen in this project

| Error name | Meaning | Root cause seen so far |
|---|---|---|
| `AuthRetryableFetchError` | Auth server returned 5xx / retryable failure | Resend SMTP "minimum interval per user" throttle (100s) rejecting rapid repeat signups |
| `AuthApiError` | Auth server returned a specific 4xx (bad creds, expired token, etc.) | Normal validation-type failures — `error.message` is usually accurate and safe to show directly |

## Related gotchas specific to this codebase

- **Supabase project's OTP length must match the client.** Confirm-signup
  email template uses `{{ .Token }}` — if the *Email OTP length* setting in
  Supabase Auth settings is 8 digits but the client `OtpStep` component only
  renders 6 input boxes and the Zod schema is `^\d{6}$`, users cannot
  possibly enter a valid code. Keep dashboard OTP length and
  `signupOtpSchema` / `verifyResetOtpSchema` regexes in sync.
- **`identities.length === 0` on signUp** means the email is already
  registered — Supabase returns no `error` in this case but also sends no
  email. Must be checked explicitly and returned as a user-facing error, or
  users get stuck on the OTP screen waiting for an email that will never
  arrive.
- **Resend "Minimum interval per user"** (Supabase Dashboard → SMTP
  settings) throttles repeat signups per email. If the client-side resend
  cooldown (currently 46s in `OtpStep`) is shorter than this server-side
  interval, users can hit a rejected send even after the UI re-enables the
  resend button. Keep these two values aligned.