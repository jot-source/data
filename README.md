# Macgence Dataset Marketplace

A dataset marketplace built with **Next.js (App Router)**, **Supabase** (Auth + Postgres + Storage), **Prisma**, and **Dodo Payments**. Sellers list datasets, buyers pay via Dodo, and paid buyers download gated files.

> **📦 This README is the handover entry point.** If you just inherited this
> project, read this page top-to-bottom, then follow the deep-dive docs it links
> to. Every setup step is written twice: dashboard clicks anyone can follow, and
> a developer-level explanation of what the code does with those values.

---

## 1. Tech stack at a glance

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19, Server Components + Server Actions) |
| Auth | Supabase Auth via `@supabase/ssr` — cookie sessions; **email+password with 8-digit OTP**, and **Google OAuth** |
| Database | Supabase Postgres, accessed through **Prisma 7** (pooled `pg` adapter) |
| Storage | Supabase Storage — `dataset-images` (public), `dataset-samples` (public), `dataset-binaries` (private) |
| Payments | **Dodo Payments** — hosted checkout + signed webhooks |
| Data fetching (client) | TanStack Query |
| UI state | Zustand (e.g. the auth modal) |
| Validation | Zod at every trust boundary (route handlers + server actions) |
| Logging | Pino (pretty in dev, JSON in prod) |
| Hosting | Vercel (auto-deploy on push to `main`) |

Full reasoning: **[docs/tech-stack-decisions.md](docs/tech-stack-decisions.md)**.

---

## 2. Quick start (local dev)

```bash
# 1. Install
npm install                 # runs `prisma generate` via postinstall

# 2. Create .env.local  (see section 3 + docs/environment-setup.md)

# 3. Apply the schema + seed test data to YOUR Supabase project
npm run db:migrate          # applies migrations to your dev DB
npm run db:seed             # 10 sample datasets + user/seller/admin test accounts

# 4. Run
npm run dev                 # http://localhost:3000
```

**Seed test accounts** (created by `prisma/seed.ts`): `admin@test.com`, plus user/seller accounts — password `Test@1234`.

### Useful scripts

| Script | Does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma migrate deploy` + `next build` (what Vercel runs) |
| `npm run db:migrate` | Create + apply a tracked migration (local dev) |
| `npm run db:migrate:deploy` | Apply pending migrations (prod/CI — never creates) |
| `npm run db:seed` | Seed sample datasets + test accounts |
| `npm run db:studio` | Prisma Studio (visual DB browser) |
| `npm run db:sync-dodo` | Backfill Dodo products for datasets missing `dodoProductId` |
| `npm run test` | Vitest |

> **Rule:** use `prisma migrate dev` locally, `prisma migrate deploy` in prod. **Never `prisma db push`** — it causes drift. See [docs/environment-setup.md](docs/environment-setup.md).

---

## 3. Environment variables

Create `market-place/.env.local` (git-ignored). Full per-key explanation, a security-boundary diagram, and a Mermaid flowchart of which key is active when are in **[docs/auth.md](docs/auth.md)** and **[docs/environment-setup.md](docs/environment-setup.md)**.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project endpoint |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser + server auth (publishable/anon key) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Used by `proxy.ts` (same value as publishable) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server/seed only — bypasses RLS.** Never expose to the browser |
| `DATABASE_URL` | Postgres via transaction pooler (`:6543`, `?pgbouncer=true`) — runtime queries |
| `DIRECT_URL` | Postgres via session pooler (`:5432`) — `prisma migrate` only |
| `NEXT_PUBLIC_APP_URL` | App base URL (auth redirects, email links) |
| `DODO_PAYMENTS_API_KEY` | Dodo SDK auth |
| `DODO_PAYMENTS_ENVIRONMENT` | `test_mode` \| `live_mode` |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Verifies inbound Dodo webhooks — **route 500s if empty** |
| `RESEND_API_KEY` | Transactional email (also configure Supabase custom SMTP for OTP) |

> ⚠️ If your DB password contains `@ : / ? # %`, **URL-encode** it in `DATABASE_URL`/`DIRECT_URL` (e.g. `@` → `%40`).

---

## 4. Handover setup checklist

Do these once per environment (dev, then prod). Each links to the click-by-click guide.

- [ ] **Supabase project** created; URL + keys + connection strings copied → [docs/auth.md → Auth Setup From Scratch](docs/auth.md)
- [ ] **Email/OTP login**: Email provider on, "Confirm email" on, **custom SMTP** configured, `{{ .Token }}` in the Confirm-signup + Reset-password templates → [docs/environment-setup.md → Supabase Auth Emails](docs/environment-setup.md)
- [ ] **Google OAuth**: Client ID/Secret created in Google Cloud, redirect URI = the Supabase callback, pasted into Supabase → Providers → Google → **[docs/auth.md → Google OAuth setup](docs/auth.md)** *(previously undocumented — start here)*
- [ ] **URL Configuration**: Site URL + Redirect URLs (`…/**`) set in Supabase
- [ ] **Storage buckets** created: `dataset-images`, `dataset-samples` (public), `dataset-binaries` (private)
- [ ] **Database**: `npm run db:migrate` + `npm run db:seed`
- [ ] **Dodo**: API key + environment flag set; webhook endpoint + `whsec_…` secret configured; products backfilled (`npm run db:sync-dodo`) → [docs/dodopayments.md → Dodo Dashboard Setup](docs/dodopayments.md)
- [ ] **Deploy**: Vercel env vars set for Production + Preview → [docs/deployment-checklist.md](docs/deployment-checklist.md)

---

## 5. How the big pieces work

### Authentication
Cookie-based Supabase SSR sessions. `proxy.ts` validates/refreshes the session on every request and guards `/account/*` + `/admin/*`. Two login methods: **email+password with 8-digit OTP** (signup confirm + password reset — no magic links) and **Google OAuth** (`/auth/callback` exchanges the code for a session). Roles: `user` / `seller` / `admin`. **→ [docs/auth.md](docs/auth.md)**

### Datasets
Public, paginated, filterable `GET /api/v1/datasets`. Role-gated `POST /api/v1/datasets` for sellers/admins, with a **two-step signed-URL upload** so large files (up to ~10GB) go **straight to Supabase Storage**, never through the serverless function. **→ [docs/datasets.md](docs/datasets.md)**, [docs/architecture-overview/api-contracts.md](docs/architecture-overview/api-contracts.md)

### Payments
Buyer clicks Buy → `POST /api/v1/checkout` (auth, server-side price lookup, pending `Order`) → Dodo hosted checkout → `POST /api/v1/webhooks/dodo` flips the Order to `paid`. Downloads are gated on a `paid` Order. **→ [docs/dodopayments.md](docs/dodopayments.md)**

---

## 6. All documentation

| Doc | What it covers |
|---|---|
| [docs/auth.md](docs/auth.md) | **Auth setup from scratch (incl. Google OAuth), session lifecycle, env keys, roles** |
| [docs/dodopayments.md](docs/dodopayments.md) | **Dodo setup, checkout + webhook flow, done vs. future scope** |
| [docs/datasets.md](docs/datasets.md) | Dataset listing, filtering, upload flow |
| [docs/environment-setup.md](docs/environment-setup.md) | Local vs prod env, env vars, SMTP/OTP, migrations across environments |
| [docs/tech-stack-decisions.md](docs/tech-stack-decisions.md) | Tech choices and reasoning |
| [docs/deployment-checklist.md](docs/deployment-checklist.md) | Deployment checklist |
| [docs/error.md](docs/error.md) | Known errors + fixes |
| [docs/regularwork.md](docs/regularwork.md) | Session-by-session development log |
| [docs/architecture-overview/](docs/architecture-overview/) | System design, DB schema, API contracts |

---

## 7. Deploying (Vercel)

Push to `main` → Vercel builds with `prisma migrate deploy && next build`. Set all env vars in **Vercel → Settings → Environment Variables** (Production + Preview scopes) **before** deploying — `NEXT_PUBLIC_*` values are baked in at build time. Point the prod Supabase URL Configuration and the Dodo webhook endpoint at your real domain. Full list: **[docs/deployment-checklist.md](docs/deployment-checklist.md)**.
