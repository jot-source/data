# Environment Guide — Dataset Marketplace

> How to work across local development and production as a developer.

---

## Two Environments

This project runs on two completely separate environments. They share the same codebase but point to different infrastructure.

| | Local | Production |
|---|---|---|
| Supabase project | Dev project (your own) | Prod project (shared/team) |
| Database | Dev DB — disposable, can reset freely | Prod DB — never reset, migrations only |
| Storage buckets | Dev buckets — test uploads here | Prod buckets — real user data |
| App URL | `http://localhost:3000` | `https://yourdomain.com` |
| Vercel | Not involved | Auto-deploys on push to `main` |
| Env file | `.env.local` (git-ignored) | Vercel environment variables (dashboard) |
| Log level | `debug` | `info` |

The codebase reads everything from environment variables. Switching environments = swapping the values in those variables. No code changes are needed between environments unless you are explicitly writing environment-conditional logic (covered below).

---

## Environment Files

### `.env` vs `.env.local` precedence

Both files can exist at the root of `market-place/`:

- **`.env`** — committed defaults / shared (team/org project) values.
- **`.env.local`** — git-ignored; **overrides** `.env` key-by-key.

**Next.js** loads `.env.local` over `.env` automatically (you'll see
`Environments: .env.local, .env` on dev start). **Prisma's CLI** does too —
`prisma.config.ts` calls `dotenv.config('.env')` then
`dotenv.config('.env.local', { override: true })` so `migrate`/`db push`/`seed`
target the **same** database the app uses. Use `.env.local` to point your local
app at your own personal Supabase project without touching the committed `.env`.

> Verify which DB Prisma resolves (project ref shows in the username):
> ```
> node -e "require('dotenv').config({path:'.env'});require('dotenv').config({path:'.env.local',override:true});console.log(process.env.DIRECT_URL.replace(/postgresql:\/\/([^:]+):.*/,'$1'))"
> ```

> **Note on key names:** this project uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
> (the `sb_publishable_…` key) for the browser/server clients, plus
> `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the proxy, and separate `DATABASE_URL`
> (transaction pooler, :6543) + `DIRECT_URL` (session pooler, :5432). See
> `docs/auth.md` for the full key reference.

### Local — `.env.local`

Create this file at the root of `market-place/`. It is git-ignored and never committed.

```bash
# Supabase — point to your DEV project
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...         # server-only — never expose to client

# Database — use the POOLER (Transaction mode) connection string from your dev project
DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true

# Dodo Payments — use sandbox/test keys
DODO_PAYMENTS_API_KEY=dodo_test_...
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_WEBHOOK_KEY=whsec_test_...

# Email
SMTP_HOST=smtp.yourmailprovider.com
SMTP_PORT=587
SMTP_USER=dev@yourdomain.com
SMTP_PASS=...
SMTP_FROM=dev@yourdomain.com

# App URL — localhost for local dev
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Logging — verbose locally
LOG_LEVEL=debug
```

### Production — Vercel Dashboard
 
Go to your Vercel project → Settings → Environment Variables. Set the same keys with production values:

```bash
# Supabase — point to your PROD project
NEXT_PUBLIC_SUPABASE_URL=https://yyyy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database — prod project pooler URL
DATABASE_URL=postgresql://postgres.yyyy:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true

# Dodo Payments — live keys
DODO_PAYMENTS_API_KEY=dodo_live_...
DODO_PAYMENTS_ENVIRONMENT=live_mode
DODO_PAYMENTS_WEBHOOK_KEY=whsec_live_...

# Email — production SMTP
SMTP_HOST=smtp.yourmailprovider.com
SMTP_PORT=587
SMTP_USER=hello@yourdomain.com
SMTP_PASS=...
SMTP_FROM=hello@yourdomain.com

# App URL — real domain
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Logging — quiet in production
LOG_LEVEL=info
```

> `NEXT_PUBLIC_*` variables are embedded into the client bundle at build time. Set them in Vercel before deploying — they cannot be changed without a redeploy.

---

## Variables That Change Between Environments

Every variable changes. Here is what each change means in practice:

| Variable | Local value | Production value | Why it differs |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Dev project URL | Prod project URL | Completely separate Supabase projects |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dev anon key | Prod anon key | Keys are project-scoped |
| `SUPABASE_SERVICE_ROLE_KEY` | Dev service role key | Prod service role key | Keys are project-scoped |
| `DATABASE_URL` | Dev pooler URL | Prod pooler URL | Different DB instances |
| `DODO_PAYMENTS_API_KEY` | Sandbox key | Live key | Test vs real payments |
| `DODO_PAYMENTS_ENVIRONMENT` | `test_mode` | `live_mode` | Points the SDK at sandbox vs live |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Sandbox webhook secret | Live webhook secret | Different Dodo environments |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://yourdomain.com` | Used in auth redirects, OG tags, email links |
| `LOG_LEVEL` | `debug` | `info` | Verbose locally, quiet in production |

---

## Code That Branches on Environment

Most of the codebase reads variables and has no environment-specific logic. These are the places where environment does affect the code path:

### 1. Pino logger — pretty print vs JSON

```ts
// lib/logger.ts
const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  // pretty-prints in development, raw JSON in production
  ...(process.env.NODE_ENV === 'development' && {
    transport: { target: 'pino-pretty', options: { colorize: true } },
  }),
})
```

`NODE_ENV` is set automatically by Next.js — `development` when running `npm run dev`, `production` when Vercel builds. You do not set this manually.

### 2. Supabase client — server vs browser

```ts
// lib/supabase/server.ts  — used in RSC and route handlers
// lib/supabase/client.ts  — used in client components ('use client')
```

Both read from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. No environment branching needed — the variable values determine which project they connect to.

### 3. Dodo Payments — sandbox vs live

Dodo Payments uses separate API keys for sandbox and live. The key value alone determines which environment the Dodo SDK operates in — no code change needed.

```ts
// lib/dodo.ts
const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT ?? 'test_mode',
})
// DODO_PAYMENTS_ENVIRONMENT=test_mode → Dodo sandbox
// DODO_PAYMENTS_ENVIRONMENT=live_mode → Dodo production
```

### 4. App URL — used in several places

`NEXT_PUBLIC_APP_URL` is referenced in:
- Auth callback redirect URLs (e.g. magic link destination)
- Email templates (order receipt links, password reset links)
- OG meta tags (`og:url`)

When this is `http://localhost:3000` locally, all those links point to localhost. In production they point to the real domain automatically.

---

## Database — Migrations Across Environments

The databases are separate. Migrations must be applied to each independently.

### Workflow when you change the schema

**Step 1 — Develop and migrate locally**

```bash
# Edit prisma/schema/schema.prisma
npm run db:migrate
# Prisma prompts for a migration name (e.g. "add_seller_id_to_datasets")
# This creates a migration file and applies it to your local (dev) DB
```

**Step 2 — Commit the migration file**

```bash
git add prisma/migrations/
git commit -m "migration: add seller_id to datasets"
git push
```

**Step 3 — Apply to production DB**

Vercel runs this automatically as part of the build if you add it as a build command, or you run it manually:

```bash
# Set DATABASE_URL to point to the production DB first (use a .env.production file or set inline)
DATABASE_URL="postgresql://prod-pooler-url" npx prisma migrate deploy
```

Or add this to your Vercel build command:
```
npx prisma migrate deploy && npx prisma generate && npm run build
```

> Never run `prisma migrate dev` against the production DB. Use `prisma migrate deploy` — it only applies pending migrations, it does not create new ones or reset anything.

### Rule: never mix `migrate dev` and `db push`

| Command | Use when | Creates migration file |
|---|---|---|
| `prisma migrate dev` | Local development — always | Yes — tracked in git |
| `prisma migrate deploy` | Production / CI | No — applies existing files |
| `prisma db push` | Never in this project | No — causes drift |

---

## Supabase Auth URLs — Must Match Environment

Supabase rejects auth redirects to URLs not on the allowlist. You must configure this separately for each project.

**Dev Supabase project** (Authentication → URL Configuration):
```
Site URL:      http://localhost:3000
Redirect URLs: http://localhost:3000/**
```

**Prod Supabase project** (Authentication → URL Configuration):
```
Site URL:      https://yourdomain.com
Redirect URLs: https://yourdomain.com/**
```

If you forget this, magic links and OAuth redirects will fail with a "redirect URL not allowed" error.

---

## Supabase Auth Emails — Custom SMTP + OTP Templates

Auth uses **OTP codes** (6-digit), not magic links — for sign-up email
verification and password reset. This requires two things configured **per
Supabase project** (dev and prod separately):

1. **Custom SMTP** (Authentication → Emails → SMTP Settings). Supabase's
   built-in email is heavily rate-limited and **only sends to org members**, and
   it **won't let you edit the email templates** — so custom SMTP is *required*
   for the OTP flow, not optional. Example (Resend):
   ```
   Host:     smtp.resend.com
   Port:     465
   Username: resend                 # the literal word, not your project name
   Password: re_xxxxxxxx            # your Resend API key, NOT a password you invent
   Sender:   onboarding@resend.dev  # or an address on a domain you verified in Resend
   ```
   > A fresh Resend account can only send **from** `onboarding@resend.dev` and
   > only **to** the email you registered with — until you verify a domain.

2. **`{{ .Token }}` in the templates** (Authentication → Emails). The template
   source only becomes editable once custom SMTP is set up. Put `{{ .Token }}`
   in **Confirm signup** and **Reset password** so the email contains the code:
   ```
   <h2>Your verification code</h2>
   <h1>{{ .Token }}</h1>
   ```
   Without `{{ .Token }}` the email is a link and the OTP boxes can never be
   satisfied. Also keep **Confirm email ON** (Providers → Email) so signup
   actually issues a code to verify.

> **Symptom map:** signup 500 with empty body = email send failing (bad SMTP) OR
> the `users.updated_at` trigger NOT NULL issue (see `db-schema.md`). "Token
> expired/invalid" on a fresh code = the email already exists (stale token) —
> delete the user in Auth → Users and retry.

---

## Storage Buckets — Create Separately in Each Project

Buckets are not shared between Supabase projects. Create them in both.

| Bucket | Visibility |
|---|---|
| `dataset-images` | Public |
| `dataset-samples` | Public |
| `dataset-binaries` | Private |

---

## Vercel Preview Deployments

Every PR gets an automatic Vercel preview URL (e.g. `https://your-app-git-feature-branch.vercel.app`).

By default these use your Production environment variables. If you want previews to use dev infrastructure, go to Vercel → Settings → Environment Variables and set variables scoped to "Preview" with dev values.

Recommended setup:

| Env var scope in Vercel | Points to |
|---|---|
| Production | Prod Supabase project, live Dodo keys |
| Preview | Dev Supabase project, sandbox Dodo keys |
| Development | Not used — handled by `.env.local` |

---

## Troubleshooting

**"Error: Invalid API key" from Supabase**
The env file is not being loaded, or you are pointing at the wrong project. Check `NEXT_PUBLIC_SUPABASE_URL` matches the project you intend.

**Auth redirect goes to localhost in production**
`NEXT_PUBLIC_APP_URL` is set to `http://localhost:3000` in Vercel. Update it to your production domain.

**Prisma "drift detected" error locally**
`db push` was used at some point. Fix:
```bash
npx prisma migrate reset --force   # drops all local dev data — safe on dev only
npm run db:migrate
```

**Dodo webhook not firing locally**
Dodo cannot reach `localhost`. Use a tunnel tool like `ngrok` to expose your local server:
```bash
ngrok http 3000
# then set the webhook URL in your Dodo sandbox dashboard to the ngrok URL
```
