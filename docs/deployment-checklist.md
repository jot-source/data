# Deployment Checklist — Dataset Marketplace

> Pre-launch steps for each release. Work through this top to bottom before every production deployment.

---

## Pre-Deployment Checklist

### 1. Code & Build

- [ ] All feature branches merged to `main`
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No lint errors (`npx eslint .`)
- [ ] All tests pass (`npm test`)
- [ ] Production build succeeds locally (`npm run build`)
- [ ] No console errors or warnings in the build output

### 2. Environment Variables

- [ ] All required env vars set in Vercel project settings
- [ ] `NEXT_PUBLIC_APP_URL` set to the production domain
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (server-only, never expose)
- [ ] `LOG_LEVEL` set to `info` (not `debug`) for production
- [ ] Dodo Payments keys set (if Epic 3 is live)
- [ ] SMTP credentials set and tested

### 3. Database

- [ ] All pending Prisma migrations applied to production DB
  ```bash
  npm run db:migrate:deploy
  # or: npx prisma migrate deploy
  ```
  - [ ] Includes `..._user_updated_at_default` (DB default on `users.updated_at`)
- [ ] `prisma generate` run against latest schema
- [ ] No schema drift between local and production DB
- [ ] _(Future)_ Role-based RLS policies — **not implemented yet**; authorization is enforced in the app layer (`getSessionUser` + route role checks). See [architecture-overview/db-schema.md → Authorization](./architecture-overview/db-schema.md)
- [ ] **`handle_new_user` trigger exists on `auth.users`** in the prod project —
  it creates the `public.users` row on signup and is **not** in the Prisma
  migrations (created by hand in Supabase). Without it, signups don't get a
  `users` row; without the `updated_at` default, the trigger throws a NOT NULL
  error and signup returns a 500.

### 4. Supabase Setup

- [ ] Storage buckets created with correct visibility:
  - `dataset-images` → Public
  - `dataset-samples` → Public
  - `dataset-binaries` → Private
- [ ] Auth URL Configuration updated:
  - Site URL: production domain
  - Redirect URLs: `https://yourdomain.com/**`
- [ ] **Custom SMTP configured** (Auth → Emails → SMTP) and a test email sent —
  required for the OTP flows (built-in email can't edit templates / is rate-limited)
- [ ] **`{{ .Token }}` in the Confirm signup + Reset password templates** (so the
  email contains the 6-digit code, not a link)
- [ ] **Confirm email ON** (Auth → Providers → Email)
- [ ] **Google OAuth** provider enabled with prod Client ID/Secret + the Supabase callback in Google's Authorized redirect URIs (see [auth.md → Google OAuth](./auth.md))
- [ ] Service role key not exposed in any client-side code

### 5. Vercel Deployment

- [ ] Connected to correct GitHub repo and branch (`main`)
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Node.js version: matches local dev / CI (24.x — keep all three in sync)
- [ ] All env vars configured in Vercel dashboard (not just `.env.local`)

### 6. Smoke Tests (Post-Deploy)

Run these manually after each deployment:

- [ ] Landing page loads correctly at production URL
- [ ] `/datasets` listing page loads with real data
- [ ] Individual dataset detail page loads (`/datasets/[slug]`)
- [ ] Sign up flow works — 6-digit OTP email arrives, code verifies, profile step saves/skips
- [ ] Password reset flow works — recovery OTP email arrives and resets
- [ ] Sign in flow works
- [ ] Sign out works
- [ ] Auth-protected routes (`/account/*`) redirect to login when unauthenticated
- [ ] Contact form submits successfully
- [ ] No 500 errors in Vercel function logs

### 7. Performance

- [ ] Core Web Vitals checked (Vercel Analytics or PageSpeed Insights)
- [ ] Images loading from Supabase CDN (not origin)
- [ ] No large client JS bundles (check Vercel build output)

---

## CI/CD Pipeline

> **Handover note — no formal Gitflow / branching workflow is set up.** There is
> no enforced Gitflow (no `develop`/`release`/`hotfix` branch model, no required
> PR reviews or protected-branch gates, no automated release process). For the
> team size and stage so far this added more ceremony than value, so work has gone
> **feature branch → PR → `main` → Vercel auto-deploy** informally. The flow below
> is the recommended convention, not something the tooling currently enforces —
> formalising Gitflow + branch protection is a reasonable next step as the team
> grows.

### What runs where

| Check | Runs on | Where it's defined | Catches |
|---|---|---|---|
| `tsc` (type-check) | Vercel build (`next build`) | built into Next.js | type errors |
| ESLint | Vercel build (`next build`) | built into Next.js | lint errors |
| Vitest (`npm test`) | GitHub Actions | `.github/workflows/ci.yml` | logic regressions — the thing Vercel's build doesn't run at all |

The GitHub Actions workflow is deliberately test-only — it doesn't duplicate `tsc`/`eslint` since Vercel's build already fails the deployment on either. It runs on every push/PR to `main`.

### Feature branch → production flow

```
git checkout main && git pull
git checkout -b feature/<name>

  build the feature, writing tests alongside the code
  npm test          ← run locally before pushing
  npx tsc --noEmit
  npx eslint .

git push -u origin feature/<name>
  → fires TWO things in parallel, independently:
      • Vercel preview deployment (isolated URL)
      • GitHub Actions CI (npm test)

open a PR (feature → main)
  → PR page shows both: the preview link + the CI check status

  manually test the real feature on the Vercel preview URL
  confirm CI is green on the PR

merge to main
  → Vercel auto-deploys main to production

run the Smoke Tests checklist (below) against the production URL
```

> **Branch protection caveat:** GitHub only *enforces* "require status checks before merging" on private repos owned by an Organization if the org is on a Team/Enterprise plan (Free org plans show the rule but don't block the merge button). Until/unless that's upgraded, treat the ❌/✅ on the PR as a manual gate — don't merge a red CI run.

### Do all tests run every time, even old ones?

**Yes, intentionally — never just the tests for what you changed.** A regression suite's entire value is that yesterday's tests catch today's code accidentally breaking yesterday's feature. Vitest runs the full suite (15 tests as of this writing) in well under a second, so there's no cost to re-running everything — that cheapness is exactly why unit tests are the right thing to gate every commit on, as opposed to slow end-to-end/browser tests (Playwright etc.), which are reserved for staging or pre-release, not every push.

### Known CI gotcha — env vars for `prisma generate`

`.env` is git-ignored and never reaches the GitHub Actions runner. `npm ci`'s `postinstall` hook runs `prisma generate`, which needs `DIRECT_URL` to exist (it only parses the schema, never connects) — without it, `npm ci` itself fails before any test runs. Fixed by setting harmless placeholder values (never a real secret) as job-level `env:` in `ci.yml`:
```yaml
env:
  DIRECT_URL: postgresql://user:password@localhost:5432/db
  DATABASE_URL: postgresql://user:password@localhost:5432/db
```

---

## Production Notes — CORS & JWT

> Handover note (covers "remaining issues related to CORS policies or JWT
> authentication in production"). **No outstanding CORS or JWT bugs are known at
> handover.** This section records how each works so a future issue is easy to
> place.

### CORS

- **App API routes (`/api/v1/*`) are same-origin.** The Next.js frontend and its
  API routes are served from the **same Vercel domain**, so browser requests to
  our own API are not cross-origin — **no custom CORS headers are configured or
  needed**, and none are set in the code.
- **Supabase** (Auth, Storage, REST) manages its own CORS and allows browser calls
  from any origin using the anon/publishable key — nothing to configure app-side.
- **Dodo** checkout is a **redirect** to Dodo's hosted page (not a cross-origin
  fetch), and the webhook is a **server-to-server POST** — neither involves browser
  CORS.
- ⚠️ CORS only becomes relevant if a **separate frontend/domain** (or the
  `data.macgence.com` VPS) starts calling these API routes directly from the
  browser. At that point add explicit `Access-Control-*` headers (per-route or via
  `next.config.ts` `headers()`), scoped to the allowed origin — do **not** use `*`
  with credentials.

### JWT authentication

- Sessions are **Supabase-issued JWTs stored in an HTTP cookie** (`@supabase/ssr`),
  not localStorage. `proxy.ts` refreshes them on every request.
- Verification is **local** via `getClaims()` (WebCrypto + cached JWKS) — no
  network call. The signature can't be forged, so it's safe for identity checks.
- **App role is read from the DB, not the JWT.** The JWT's `role` claim is always
  the Postgres role `authenticated`; our `user`/`seller`/`admin` role comes from
  the `users` row via `getSessionUser`. Any future move to role-based RLS needs the
  app role surfaced into the JWT (custom access-token hook) — see db-schema.md.
- **Common prod pitfalls to check first** if auth misbehaves after deploy:
  - `NEXT_PUBLIC_APP_URL` wrong → OAuth/redirect + cookie domain issues.
  - Supabase **URL Configuration** Site/Redirect URLs not set to the prod domain
    → OAuth "redirect not allowed" / session not established.
  - Clock skew or a rotated Supabase JWT secret → `getClaims()` rejects tokens
    (users appear logged out). Re-check keys match the prod project.

---

## Rollback Plan

If a deployment causes issues:

1. Go to Vercel Dashboard → Deployments
2. Find the last known-good deployment
3. Click **Promote to Production**
4. If DB migrations were applied, assess whether a rollback migration is needed

--- 

## Release Notes

Document what changed in each release in [regularwork.md](./regularwork.md).

---

## Environment-Specific Notes

| Environment | DB | Supabase Project | Vercel |
|---|---|---|---|
| Local | Dev Supabase project | Dev project | `npm run dev` |
| Production | Production Supabase project | Prod project | Vercel (auto-deploy on push to `main`) |

> Always keep dev and production on **separate** Supabase projects — never run migrations against production from a local machine.

