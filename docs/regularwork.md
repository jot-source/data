# AI Development Log

> Running record of all AI-assisted development sessions for the Dataset Marketplace project.

---

## Session 1 — 2026-06-16

### 1. Prisma Schema Created from Architecture Spec

**Problem:** The initial `schema.prisma` only had bare-bones `User` and `Dataset` models, and referenced a `Purchase` model that didn't exist — causing Prisma validation errors.

**What was done:**
- Rewrote `prisma/schema/schema.prisma` to match Section 6 of `docs/architecture.md`
- Created **6 models** mapping to snake_case database tables:

| Model | DB Table | Status |
|---|---|---|
| `User` | `users` | MVP — mirrors Supabase `auth.users.id` |
| `Dataset` | `datasets` | MVP — full spec (slug, industry, category, tags, pricing, storage URLs) |
| `DatasetImage` | `dataset_images` | MVP — gallery images per dataset |
| `Order` | `orders` | Scaffolded (Epic 3 — Payments) |
| `Download` | `downloads` | Scaffolded (Epic 6 — Post Purchase) |
| `Contact` | `contacts` | MVP — contact form submissions |

**Key schema decisions:**
- All IDs use `uuid()` to align with Supabase auth
- `@map()` on fields for snake_case DB columns (e.g., `fullName` → `full_name`)
- `@@map()` on models for snake_case table names (e.g., `User` → `users`)
- GIN index on `tags` array for efficient filtering
- Regular indexes on `industry`, `category`, `language`
- `Decimal(10,2)` for all monetary fields (`price`, `amount`)
- Cascade deletes on all foreign key relations

**File changed:** `market-place/prisma/schema/schema.prisma`

---

### 2. Migration Pushed to Supabase

**Commands run:**
```bash
npx prisma migrate dev --name init
```

- Created migration `20260616064805_init`
- All 6 tables created in Supabase PostgreSQL at `aws-1-ap-southeast-2.pooler.supabase.com`
- Migration SQL saved at `prisma/migrations/20260616064805_init/migration.sql`

**User also manually ran:**
```bash
npx prisma db push   # confirmed DB in sync
```

---

### 3. Package.json — Prisma Scripts & Client Dependency Added

**Problem:** `@prisma/client` was missing as a dependency, and there were no shortcut scripts for Prisma commands.

**What was done:**
- Added `@prisma/client` to dependencies
- Added 7 convenience scripts to `package.json`:

| Script | Command | Purpose |
|---|---|---|
| `npm run db:generate` | `prisma generate` | Regenerate Prisma Client after schema changes |
| `npm run db:push` | `prisma db push` | Push schema to DB without migration (prototyping) |
| `npm run db:migrate` | `prisma migrate dev` | Create & apply a tracked migration |
| `npm run db:migrate:deploy` | `prisma migrate deploy` | Apply pending migrations (production/CI) |
| `npm run db:studio` | `prisma studio` | Visual DB browser at localhost:5555 |
| `npm run db:seed` | `prisma db seed` | Run seed script for test data |
| `postinstall` | `prisma generate` | Auto-generates client on `npm install` |

**File changed:** `market-place/package.json`

---

### 4. User's Manual Schema Edit

The user manually added `updatedAt` field to the `User` model and removed `password_hash` from `database-schema.md` (since Supabase Auth handles passwords, not our DB).

---

### 5. Prisma Concepts Explained

Covered the following for team knowledge:

- **What Prisma is:** An ORM that replaces raw SQL with type-safe TypeScript queries
- **`prisma generate`:** Reads schema → generates typed client in `node_modules`
- **`prisma db push`:** Directly syncs schema to DB, no migration file — good for prototyping
- **`prisma migrate dev`:** Creates a tracked SQL migration file + applies it — good for real development --> use this only as the db:push will not createa an migration file and store the history 
- **`prisma migrate deploy`:** Applies pending migrations in production/CI (doesn't create new ones)
- **`prisma studio`:** Visual web UI to browse/edit data
- **`prisma db seed`:** Populates DB with initial/test data from a seed script
- **`db push` vs `migrate dev`:** Push for rapid prototyping, migrate for tracked/production-safe changes

---

### 6. Schema Simplified for MVP

**What was done:**
- **Removed `DatasetImage` model** — gallery images now stored as `imageUrls String[]` directly on the `Dataset` model. A separate table with sort ordering can be added in a future epic if needed.
- **Removed `Contact` model** — deferred to a future epic when the contact form feature is built.
- **Added `imageUrls` column** to `Dataset` (`image_urls text[]` in the DB) for storing gallery CDN URLs.

**Final MVP schema (4 tables):**

| Model | DB Table | Purpose |
|---|---|---|
| `User` | `users` | Auth users synced from Supabase |
| `Dataset` | `datasets` | All dataset metadata + `image_urls` array |
| `Order` | `orders` | Scaffolded for Epic 3 (Payments) |
| `Download` | `downloads` | Scaffolded for Epic 6 (Post Purchase) |

**Migration created:** `20260616074414_simplify_mvp_remove_images_contacts`

**architecture.md updated:**
- Section 6.3 (`dataset_images`) marked as ~~deferred~~ with a note, original schema kept in HTML comment
- Section 6.6 (`contacts`) marked as ~~deferred~~ with a note, original schema kept in HTML comment
- `image_urls` column added to the datasets table spec

**Lesson learned — `db push` vs `migrate dev` drift:**
Earlier, `updatedAt` was added to `User` and synced via `db push`, but this wasn't tracked in migration history. When `migrate dev` ran next, it detected a drift and refused to proceed. Fixed with `prisma migrate reset --force` (safe on a dev DB with no data). **Rule: always use `migrate dev`, never mix with `db push`.**

**Files changed:**
- `market-place/prisma/schema/schema.prisma`
- `docs/architecture.md`

---

### 7. Supabase Auth Integration (User-implemented)

The user manually set up Supabase Auth with the following:

**Server actions** (`src/actions/auth.actions.ts`):
- `signUp(email, password)` — registers via Supabase Auth, sends confirmation email
- `signIn(email, password)` — signs in via password, redirects to `/`
- `signOut()` — signs out and redirects to `/login`
- `forgotPassword(email)` — sends reset email via `resetPasswordForEmail()`, redirects to `/reset-password`
- `resetPassword(newPassword)` — updates password via `updateUser()`, redirects to `/login`

**Supabase clients:**
- `src/lib/supabse/client.ts` — browser-side Supabase client
- `src/lib/supabse/server.ts` — server-side client using cookies for SSR session persistence

**Middleware** (`proxy.ts`):
- Reads Supabase session cookie on every request
- Protects `/account/*` and `/admin/*` routes — redirects to `/login?next=` if no session

**Auth pages created (bare bones):**
- `src/app/(auth)/sign-up/page.tsx`
- `src/app/(auth)/sign-in/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`

---

### 8. Auth Pages — Premium UI Styling (AI-implemented)

**What was done:**
Replaced the bare-bones auth pages with a premium dark-themed design using Tailwind CSS. All 4 auth pages share a consistent visual language.

**New file — shared auth layout** (`src/app/(auth)/layout.tsx`):
- Deep dark background (`#0a0e1a`) with animated gradient blur blobs (indigo, violet, cyan)
- Centered glassmorphism card (`backdrop-blur-xl`, subtle border)
- Macgence brand logo + wordmark at top
- Footer with copyright

**Styled pages:**

| Page | Route | Key Features |
|---|---|---|
| Sign Up | `/sign-up` | Email, password, confirm password, validation, loading spinner, success state with "check your email" message |
| Sign In | `/sign-in` | Email, password, inline "Forgot password?" link, loading spinner, error display |
| Forgot Password | `/forgot-password` | Email input, success state with "reset link sent" message (NEW page) |
| Reset Password | `/reset-password` | New password + confirm, validation, loading spinner |

**Design system (consistent across all pages):**
- Inputs: dark glass style with indigo focus ring
- Buttons: gradient indigo→violet with glow shadow, hover brightness, press scale
- Errors: red-tinted banner with border
- Labels: uppercase tracking, muted white
- Links: indigo accent color with hover transition
- Divider: "OR" separator between form and alternative action
- Loading: spinning SVG indicator in button

**Files created/changed:**
- `src/app/(auth)/layout.tsx` — NEW
- `src/app/(auth)/sign-up/page.tsx` — restyled
- `src/app/(auth)/sign-in/page.tsx` — restyled
- `src/app/(auth)/forgot-password/page.tsx` — NEW
- `src/app/(auth)/reset-password/page.tsx` — restyled

---

### 9. Landing Page — Minimal MVP (AI-implemented)

**What was done:**
Created a simple but premium landing page matching the dark theme established in the auth pages.

**Sections:**
| Section | Content |
|---|---|
| **Navbar** | Sticky glassmorphic bar — brand logo, nav links (Datasets, About, Contact), Sign In + Get Started CTAs |
| **Hero** | "Early Access" badge, gradient headline "Premium Datasets for AI & Analytics", subtitle, dual CTA buttons (Browse Datasets + Learn More), stats strip (500+ Datasets, 12 Industries, 99.9% Uptime) |
| **Categories** | 8-card grid of industries (Finance, Healthcare, E-Commerce, NLP, CV, Geospatial, Social Media, Climate) with emoji icons, dataset counts, hover effects |
| **CTA** | "Ready to get started?" section with Create Free Account button |
| **Footer** | Brand logo, nav links, copyright |

**Also fixed:**
- `src/app/layout.tsx` — removed broken `bg-blue-100`, set dark theme `bg-[#0a0e1a]`, updated SEO metadata
- `src/app/globals.css` — removed light theme defaults, set dark background, added smooth scrolling + custom dark scrollbar

**Files created/changed:**
- `src/app/page.tsx` — rewritten (landing page)
- `src/app/layout.tsx` — fixed theme + metadata
- `src/app/globals.css` — dark theme defaults

---

## Session 2 — 2026-06-17

### 10. Order Schema Updated — DodoPayments IDs Added

**What was done:**
- Added `dodoSessionId` (`dodo_session_id`) — the checkout session ID returned when a payment session is created with DodoPayments.
- Added `dodoPaymentId` (`dodo_payment_id`) — the final payment ID fired by the Dodo webhook after a successful payment.
- Both fields are optional (`String?`) — they are `null` when the order is first created and filled in as the payment progresses.
- Migration run: `npx prisma migrate dev --name cart_style_orders`

**Updated Order model fields:**

| Field | DB Column | Type | Purpose |
|---|---|---|---|
| `dodoSessionId` | `dodo_session_id` | `String?` | Checkout session ID from DodoPayments |
| `dodoPaymentId` | `dodo_payment_id` | `String?` | Final payment ID from Dodo webhook |

**File changed:** `prisma/schema/schema.prisma`

---

### 11. DodoPayments — Payment Flow Structure (Planned)

> Structure and endpoint design only — no code written yet.

#### Flow Overview

```
User clicks "Buy" 
  → POST /api/payments/create-session
      → DodoPayments creates a checkout session
      → Returns { sessionId, checkoutUrl }
  → User is redirected to Dodo-hosted checkout page
  → User pays
  → Dodo fires webhook → POST /api/webhooks/dodo
      → We verify the webhook signature
      → We update the Order (status: 'paid', dodoPaymentId, paidAt)
      → We create a Download record
  → User lands on /payment/success?orderId=...
```

---

#### API Endpoints

**`POST /api/payments/create-session`**

Purpose: Creates a DodoPayments checkout session for a dataset purchase.

Request payload:
```json
{
  "datasetId": "uuid-of-the-dataset"
}
```

Response:
```json
{
  "sessionId": "dodo_sess_xxxx",
  "checkoutUrl": "https://checkout.dodopayments.com/session/dodo_sess_xxxx"
}
```

What happens server-side:
1. Verify user is authenticated (Supabase session).
2. Look up the dataset price.
3. Create an `Order` in DB with `status: "pending"` and `dodoSessionId` saved.
4. Call DodoPayments API to create checkout session.
5. Return `checkoutUrl` to redirect the user.

---

**`POST /api/webhooks/dodo`**

Purpose: Receives payment confirmation from DodoPayments after a successful payment.

Webhook payload (fired by Dodo after payment):
```json
{
  "type": "payment.succeeded",
  "data": {
    "payment_id": "dodo_pay_xxxx",
    "session_id": "dodo_sess_xxxx",
    "amount": 4900,
    "currency": "USD",
    "status": "succeeded",
    "customer": {
      "email": "user@example.com"
    },
    "metadata": {
      "orderId": "our-internal-order-uuid",
      "userId": "supabase-user-uuid",
      "datasetId": "dataset-uuid"
    }
  },
  "created_at": "2026-06-17T12:00:00Z"
}
```

What happens server-side:
1. Verify webhook signature using Dodo's signing secret (prevent spoofing).
2. Find the `Order` by `orderId` from `metadata`.
3. Update Order → `status: "paid"`, `dodoPaymentId`, `paidAt`.
4. Create a `Download` record for the user.
5. Return `200 OK` to Dodo (otherwise Dodo retries).

---

#### Order Status Lifecycle

```
pending  →  paid      (webhook: payment.succeeded)
pending  →  failed    (webhook: payment.failed)
paid     →  refunded  (webhook: payment.refunded — future)
```

---

## Session 3 — 2026-06-23

### 12. Auth Documentation Created

**What was done:**
- Created `docs/auth.md` — a full reference document covering everything about how Supabase Auth works in this project.

**Contents of `docs/auth.md`:**
- Why cookies are used instead of localStorage/sessionStorage
- Full step-by-step session flow: login → proxy → server component
- Both Supabase clients explained:
  - `src/lib/supabse/client.ts` — `createBrowserClient` for Client Components
  - `src/lib/supabse/server.ts` — `createServerClient` for Server Components, Server Actions, Route Handlers
- `proxy.ts` explained — why it's named `proxy.ts` (latest Supabase SSR naming), what it does, and how it refreshes + writes cookies on every request
- **Three auth methods compared** (latest Supabase docs, June 2026):
  - `getClaims()` — validates JWT locally via WebCrypto, no network call — **recommended for protecting pages**
  - `getUser()` — live network call to Supabase Auth server — use only when freshest data is needed
  - `getSession()` — returns raw token, does **not** revalidate — never use for auth checks
- Auth pages and all 5 server actions documented
- Role system: `user` / `seller` / `admin`
- Env var mismatch flagged: `proxy.ts` uses `ANON_KEY`, `server.ts` uses `PUBLISHABLE_KEY`

**File created:** `docs/auth.md`

---

### 13. GET /api/v1/datasets — Datasets Listing Endpoint

**Problem:** No API route existed to fetch datasets for the browse/listing page.

**What was done:**
Created a 3-layer architecture for the datasets endpoint:

**Layer 1 — Types** (`src/types/dataset.ts`):
- `DatasetCard` interface — 7 fields only: `id`, `title`, `slug`, `description`, `category`, `language`, `thumbnailUrl`
- `DatasetsListResponse` — shape of the JSON response body

**Layer 2 — Service** (`src/services/dataset.service.ts`):
- `getPublishedDatasets()` — Prisma `findMany` with `select` (lightweight projection, no over-fetching)
- Filters `isPublished: true` — guests never see draft datasets
- `orderBy: { createdAt: 'desc' }` — newest first
- Pino logging: `logger.info` on start + success (with count), `logger.error` on DB failure
- Re-throws on error so the route returns a clean 500

**Layer 3 — Route Handler** (`src/app/api/v1/datasets/route.ts`):
- `GET /api/v1/datasets` — public, no auth required
- Returns `{ datasets: DatasetCard[] }` with `200`
- Returns `{ error: "..." }` with `500` on failure
- Route handler only handles HTTP concerns — all DB logic lives in the service

**API versioning note:** Route initially created at `/api/datasets`, immediately moved to `/api/v1/datasets` to match the project's versioning structure. Old unversioned folder deleted.

**Files created:**
- `src/types/dataset.ts`
- `src/services/dataset.service.ts`
- `src/app/api/v1/datasets/route.ts`

---

### 14. Dataset Seed Data

**Problem:** No data in the DB — nothing to test the API or listing page with.

**What was done:**
- Created `prisma/seed.ts` with 10 realistic datasets covering all 8 landing page industries:

| # | Dataset | Industry | Price | Format |
|---|---|---|---|---|
| 1 | Global E-Commerce Transactions 2024 | E-Commerce | $149.99 | .csv |
| 2 | Clinical Trial Records — Oncology Phase II | Healthcare | $499.00 | .parquet |
| 3 | Indian Stock Market — 10-Year OHLCV | Finance | $299.00 | .csv |
| 4 | Twitter Sentiment Corpus — Tech 2023 | NLP | $89.99 | .json |
| 5 | Urban Traffic Camera — Object Detection | Computer Vision | $349.00 | .zip |
| 6 | Global Weather Stations — 30-Year Climate | Climate | $199.00 | .parquet |
| 7 | Multi-Language News Articles — 12 Languages | NLP | $129.00 | .json |
| 8 | Retail Store Footfall & Heatmap Data | E-Commerce | $219.00 | .csv |
| 9 | Satellite Land-Use Classification — South Asia | Geospatial | $599.00 | .tiff |
| 10 | Customer Support Chat Logs — SaaS Industry | NLP | $179.00 | .json |

Each dataset has: auto-generated slug, realistic `fileSizeBytes` + `rowCount`, Unsplash `thumbnailUrl` + `imageUrls`, `isPublished: true`.

**File created:** `prisma/seed.ts`

---

### 15. Seed Command — Prisma Config Setup

**Problem:** `npm run db:seed` said "No seed command configured" — Prisma 7 reads seed config from `prisma.config.ts`, not `package.json`.

**What was done:**
- Added `migrations.seed` to `prisma.config.ts`:

```ts
migrations: {
  path: "prisma/migrations",
  seed: "bun prisma/seed.ts",
},
```

- Initially used `ts-node --compiler-options {"module":"CommonJS"}` — needed because `ts-node` doesn't support ESM natively and required downcompiling to CommonJS.
- **Switched to `bun prisma/seed.ts`** — Bun runs TypeScript with native ESM support, no compiler flag hacks. Cleaner and faster.
- Removed stale `"prisma": { "seed": "..." }` block from `package.json` — Prisma 7 ignores it in favour of `prisma.config.ts`.
- `ts-node` kept in devDependencies in case other tooling needs it.

**Seed confirmed working — all 10 datasets created successfully.**

**Files changed:**
- `prisma/seed.ts` — NEW
- `prisma.config.ts` — added `migrations.seed`
- `package.json` — removed stale `prisma.seed` block; `ts-node` added to devDependencies

---

### 16. Seed Script Fixes — Path Alias & Env Key Errors

**Problems encountered:**

| Error | Cause | Fix |
|---|---|---|
| `Cannot find module '@/lib/logger'` | `@/` path alias only works inside the Next.js bundler context. `ts-node`/`tsx` run outside the bundler and don't resolve TypeScript path aliases | Removed `@/lib/logger` import from seed; replaced all `logger.*` calls with `console.log/warn/error` |
| `supabaseKey is required` | `SUPABASE_SERVICE_ROLE_KEY` was missing from `.env` entirely | Added the key to `.env` (sourced from Supabase Dashboard → Settings → API) |
| `tsx` supabase ESM error | `@supabase/supabase-js` ESM/CJS interop issue with `tsx` runner | Switched runner back to `ts-node --compiler-options {"module":"CommonJS"}` |

**Rule learned:** Never import from `@/` in files outside `src/`. The `@/` alias is a TypeScript compiler path only — it has no runtime meaning when running scripts directly.

**Also discovered:** `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` were missing from `.env`. Added both. Also flagged that `proxy.ts` uses `ANON_KEY` while `server.ts` uses `PUBLISHABLE_KEY` — both should be standardised to one name.

**Files changed:**
- `prisma/seed.ts` — removed `@/lib/logger` import, replaced all `logger.*` with `console.*`, added `import 'dotenv/config'`

---

### 17. Environment Variables Documentation + Key Interaction Flowchart

**What was done:**
- Expanded `docs/auth.md` — replaced the bare env section with a full reference covering all 7 environment variables

**Documented for each key:**
- Whether it's safe to expose to the browser (`NEXT_PUBLIC_*` vs server-only)
- Which file/layer uses it
- Exactly when it becomes active during a user interaction
- What breaks if it's missing

**Keys documented:**

| Key | Visible to Browser | Active When |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Every Supabase call — always |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | Sign-in, sign-up, session reads in server components |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Proxy runs on every protected route request |
| `DATABASE_URL` | ❌ | Every Prisma runtime query |
| `DIRECT_URL` | ❌ | Migrations only (`prisma migrate dev`) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Forgot password flow — reset link in email |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | Seed script only — never at runtime |

**Added a Mermaid flowchart** in `docs/auth.md` showing which key is active at every step of the user journey — from visiting a page → proxy check → sign-in → session read → Prisma query → client component — plus separate subgraphs for seed and migrations.

**Files changed:**
- `docs/auth.md` — replaced env section with full key reference table, security boundary diagram, Mermaid interaction flowchart, and per-key breakdown

---

### 18. GET /api/v1/datasets — Pagination + Filtering

**Problem:** The listing endpoint returned every published dataset in one response with no way to filter or page through results.

**What was done:**

**Layer 1 — Types** (`src/types/dataset.ts`):
- `DatasetsQueryParams` — `page`, `limit` + one optional field per filterable `datasets` column: `industry`, `category`, `language`, `tags`, `currency`, `fileFormat`, `minPrice`, `maxPrice`
- `PaginationMeta` — `page`, `limit`, `total`, `totalPages`
- `DatasetsListResponse` now includes `pagination` alongside `datasets`

**Layer 2 — Service** (`src/services/dataset.service.ts`):
- `getPublishedDatasets(params)` builds a `Prisma.DatasetWhereInput` dynamically — only includes a filter if the caller passed it
- `tags` uses `hasSome` (matches ANY requested tag, not all)
- `price` filter builds `gte`/`lte` independently so `minPrice`-only or `maxPrice`-only both work
- `findMany` + `count` run inside `prisma.$transaction` so `total` can't drift from the page of rows returned
- Pino logging: `logger.info` on start (with the resolved `where` + page/limit) and on success (counts), `logger.error` on failure — re-throws so the route returns a clean 500

**Layer 3 — Route Handler** (`src/app/api/v1/datasets/route.ts`):
- Parses `page`, `limit`, `minPrice`, `maxPrice` from query params with manual validation (positive integers / non-negative floats) — no validation library in this project, so kept consistent with that
- `limit` capped at `MAX_LIMIT = 100` to prevent a client forcing a full-table fetch
- `tags` query param is comma-separated, trimmed, empty entries dropped
- Returns `400` with a descriptive error on invalid pagination/price params, or when `minPrice > maxPrice`
- `logger.warn` on validation failures, `logger.info`/`logger.error` around the service call (same pattern as before)

**Verified manually** against the running dev server: default listing, `page`/`limit`, `category` filter, `tags` filter (`hasSome` match), and both 400 validation paths (`page=abc`, `minPrice > maxPrice`) all returned the expected shape/status.

**Files changed:**
- `src/types/dataset.ts`
- `src/services/dataset.service.ts`
- `src/app/api/v1/datasets/route.ts`

---

### 19. Zod Validation — Every Backend Entry Point

**Problem:** The manual parsing added in #18 worked but every rule was hand-rolled (separate `parsePositiveInt`/`parseNonNegativeFloat`/`parseTags` helpers). Worse, the two Server Actions in `src/actions/auth.actions.ts` (`signUp`, `signIn`, `forgotPassword`, `resetPassword`) had **zero server-side validation** — only the client form had a password-length/match check, which doesn't protect anything since Server Actions can be called directly, bypassing the UI entirely.

**Design decision:** Validate once at each trust boundary (Route Handler / Server Action) with Zod, then pass the already-validated, typed object down through the service layer. The service/Prisma layers don't re-validate — they trust their caller, same as before. Re-validating at every internal function call would add maintenance cost without a security benefit; the actual untrusted input only enters at the two boundaries listed below.

**Added `zod` as a direct dependency** (was previously only a transitive dep of `eslint-plugin-react-hooks` — not safe to import from app code without pinning it explicitly).

**New files:**
- `src/lib/validations/dataset.schema.ts` — `datasetsQuerySchema`, one field per filterable `datasets` column:
  - `page`/`limit` — coerced positive integers, `limit` capped at 100
  - `industry`/`category`/`language`/`fileFormat` — trimmed, capped at 100 chars (operational cap; the DB columns are unbounded `text`)
  - `currency` — must be exactly 3 chars (ISO 4217), normalized to uppercase
  - `tags` — comma-separated string transformed into a deduped, max-20-item array
  - `minPrice`/`maxPrice` — non-negative, capped at `99999999.99` (mirrors the `Decimal(10,2)` column), `.refine()` rejects `minPrice > maxPrice`
  - Exports `DatasetsQueryParams` via `z.infer` — single source of truth, replacing the hand-written interface that used to live in `src/types/dataset.ts`
- `src/lib/validations/auth.schema.ts` — `signUpSchema`, `signInSchema`, `forgotPasswordSchema`, `resetPasswordSchema`:
  - `email` — trimmed, lowercased, RFC-validated, capped at 255 chars
  - `password` (creation/reset) — min 6 chars (matches the existing client-side copy "Min. 6 characters"), capped at 128
  - `password` (sign-in) — only length-bounded, not re-validated for complexity, since sign-in checks an existing credential rather than creating one

**Changed files:**
- `src/app/api/v1/datasets/route.ts` — replaced the manual parse helpers with `datasetsQuerySchema.safeParse()`; on failure, returns `400` with `{ error, details: [{ field, message }] }` and `logger.warn`s the raw query + Zod issues
- `src/services/dataset.service.ts` — now imports `DatasetsQueryParams` as a type from the schema file instead of `src/types/dataset.ts`; no other logic changes
- `src/types/dataset.ts` — removed the duplicate `DatasetsQueryParams` interface
- `src/actions/auth.actions.ts` — every action now runs `<schema>.safeParse()` first and returns `{ error: <first issue message> }` on failure before touching Supabase; added `logger.warn` on validation failure, `logger.info`/`logger.error` around every Supabase call (previously had no logging at all)

**Verified:**
- `tsc --noEmit` and `eslint` clean on all touched files
- Manually hit the running dev server: valid filters/pagination, invalid `page`, `minPrice > maxPrice`, bad `currency` length, and `limit` over the cap all returned the correct `400` + field-level detail
- Ran the auth schemas directly (`tsx`) against bad email, short password, empty sign-in password, and an oversized reset password — all rejected with the expected message; valid input correctly trims/lowercases the email

**Note (not fixed, out of scope):** `signOut()` and `resetPassword()` both `redirect('/login')`, but the actual route is `/sign-in` — pre-existing bug, unrelated to this change.

**Files changed:**
- `src/lib/validations/dataset.schema.ts` — NEW
- `src/lib/validations/auth.schema.ts` — NEW
- `src/app/api/v1/datasets/route.ts`
- `src/services/dataset.service.ts`
- `src/types/dataset.ts`
- `src/actions/auth.actions.ts`
- `package.json` — added `zod` to dependencies

---

### 20. Removed `image_urls` From `datasets` — Unused Gallery Field

**Problem:** While reviewing `dataset.service.ts`, noticed `datasets` had both `thumbnail_url` (single image, used by the browse-page card) and `image_urls` (gallery array, seeded with 1–2 Unsplash URLs per dataset but never read by any route/service/component — the detail page that would use it isn't built yet).

**Decision:** Drop `image_urls` now; re-add it (flat column or a sort-ordered `dataset_images` table) once the detail-page gallery is actually being built, rather than carrying an unused column.

**What was done:**
- `prisma/schema/schema.prisma` — removed the `imageUrls String[] @map("image_urls")` field from `Dataset`
- Migration `20260623095110_remove_dataset_image_urls` — `ALTER TABLE "datasets" DROP COLUMN "image_urls"`. Written by hand and applied via `prisma migrate deploy` instead of `prisma migrate dev`, because `migrate dev`'s data-loss confirmation prompt (the column had 10 non-null seed rows) requires an interactive terminal and this session's shell is non-interactive. `prisma migrate status` confirms no drift afterwards.
- `prisma/seed.ts` — removed the `imageUrls: [...]` block from all 10 seed datasets
- Re-ran `npm run db:seed` — datasets recreated cleanly without the column
- `docs/architecture-overview/db-schema.md` — removed the `image_urls` row from the `datasets` table; merged the gallery note into the "Deferred Tables" section (both the flat-column shape and the `dataset_images` table are now listed as options for whenever the detail-page gallery gets built)

**Note:** Session 1 / entry #6 and #14 above describe `imageUrls` as it existed at the time — left as-is since this file is a running record, not living documentation.

**Files changed:**
- `prisma/schema/schema.prisma`
- `prisma/migrations/20260623095110_remove_dataset_image_urls/migration.sql` — NEW
- `prisma/seed.ts`
- `docs/architecture-overview/db-schema.md`

---

### 21. Auth Verification → `getClaims()` + `POST /api/v1/datasets` Validation

**Context:** A `POST /api/v1/datasets` route (create a listing, seller/admin only) was added that did its auth check with `supabase.auth.getUser()` and hand-rolled `if (!title || ...)` validation. `auth.md` recommends `getClaims()` for auth checks (local JWT verification via WebCrypto — no network round-trip), so both the route and the upload action were migrated, and validation moved to Zod.

**Three problems found in the new POST route (all fixed):**
1. Used `getUser()` (network call per request) instead of the recommended `getClaims()`.
2. Wrote `imageUrls` into `prisma.dataset.create()` — but that column was **removed in #20**, so the route wouldn't have compiled/run.
3. Hand-rolled validation that, e.g., let an empty `price` slip through and didn't bound any field.

**What was done:**

**New shared auth helper** (`src/services/auth.service.ts`):
- `getSessionUserId(cookieStore)` → `string | null` — the JWT `sub` (mirrors `users.id`), via `getClaims()`
- `getSessionUser(cookieStore)` → `{ id, email, role } | null` — same identity check, then reads the app `role` from the DB (the JWT `role` claim is the Postgres role `authenticated`, not our `user`/`seller`/`admin`)
- Both return `null` on no session / invalid token / missing `users` row; `logger.warn` on the odd cases

**New create schema** (`src/lib/validations/dataset.schema.ts` → `createDatasetSchema`):
- Validates the multipart form metadata: `title`, `description`, `industry`, `category` required; `language`, `fileFormat`, `rowCount` optional; `currency` defaults to `'USD'` (3-letter ISO, uppercased); `tags` defaults to `[]`
- `price`/`rowCount` coerced from form strings with blank → `undefined` preprocessing so an empty field fails the required check instead of silently coercing to `0`
- All fields length/range-bounded (`price` ≤ the `Decimal(10,2)` max, `rowCount` ≤ int4 max)

**Route** (`src/app/api/v1/datasets/route.ts`):
- POST auth now `getSessionUser()` → 401 if no session, 403 if role isn't seller/admin
- Body validated with `createDatasetSchema.safeParse()` → 400 with `{ field, message }[]` detail on failure
- Removed the `imageUrls` write and stopped reading/uploading gallery `images` (column is gone)
- Wrapped create in try/catch: Prisma `P2002` (duplicate slug) → 409, anything else → 500; `logger` at each stage
- GET route unchanged (public, no auth)

**Upload action** (`src/actions/upload.actions.ts`):
- Switched from `getUser()` to `getSessionUser()`
- **Added the role check** its comment always claimed but never enforced — now actually throws `Forbidden` for non-seller/admin (was only checking that *a* user existed)

**Verified:**
- `tsc --noEmit` + `eslint` clean on all touched files
- Ran `createDatasetSchema` directly (`tsx`): blank/non-numeric/negative price, missing title, lowercase→normalized currency, bad currency length, float rowCount, and non-array tags all rejected with the right message; minimal valid input defaults currency/tags correctly
- Live dev server: `GET` still returns data; `POST` with no session returns `401 Unauthorized` (confirms the `getClaims` → null path)

**Note:** `proxy.ts` still uses `getUser()` — left as-is (standard Supabase SSR middleware pattern, also refreshes the cookie, runs only on protected routes). Documented in `auth.md`.

**Files changed:**
- `src/services/auth.service.ts` — NEW
- `src/lib/validations/dataset.schema.ts` — added `createDatasetSchema`
- `src/app/api/v1/datasets/route.ts` — POST auth + validation + imageUrls fix
- `src/actions/upload.actions.ts` — getClaims + role check
- `docs/auth.md` — added "Where Each Method Is Used in This Codebase"

---

### 22. Proxy → `getClaims()` (supersedes the note in #21)

**What was done:** Migrated `proxy.ts` from `getUser()` to `getClaims()`, finishing the `getClaims()` rollout — there are now no `getUser()` calls left in the app's auth path.

- `getClaims()` verifies the JWT locally via WebCrypto (no network round-trip) **and** still refreshes the session cookie when the token is near expiry, so the middleware's cookie-refresh side effect — the reason the Supabase SSR example uses `getUser()` here — is preserved.
- Guard logic unchanged: `data?.claims` present → authenticated; `/account/*` and `/admin/*` still redirect to `/login?next=...` when there's no valid session. The proxy only checks session validity, not the app role.
- Also fixed the stale `// middleware.ts` header comment → `// proxy.ts`.

**#21's closing note ("proxy.ts still uses getUser() — left as-is") no longer applies.**

**Verified:** `tsc --noEmit` clean; dev server still gates protected routes (unauthenticated `/account` → redirect to `/login`).

**Files changed:**
- `proxy.ts`
- `docs/auth.md` — updated the proxy code sample + the two notes that referenced `getUser()`

---

### 23. Dataset File Uploads → Direct-to-Storage Signed URLs (no bytes through the API)

**Problem:** The `POST /api/v1/datasets` route accepted `multipart/form-data` and streamed the thumbnail/sample/binary file bytes **through** the Next.js function before re-uploading them to Supabase Storage. On Vercel that's a dead end — serverless functions cap the request body at a few MB and time out quickly, while the seed data has dataset binaries up to **10GB**. JSON-vs-form-data was the wrong question; the real fix is to not route big files through the server at all.

**New flow (two steps, files go straight to storage):**
1. `POST /api/v1/datasets/upload-url` (NEW) → seller/admin asks for a signed upload URL for one file (`kind: 'binary' | 'sample'`). Server derives the object key from the title and returns `{ bucket, path, token, signedUrl }`.
2. Client uploads the bytes **directly** to Supabase Storage via that signed URL (`uploadToSignedUrl`).
3. `POST /api/v1/datasets` now takes **JSON** (metadata + `binaryPath` / `samplePath`). For each path it (a) checks the path matches the key it would have generated for that title, and (b) verifies the object actually exists in storage (and reads its size) before writing the row. The server never sees file bytes.

**Scope decisions (per request):**
- **Thumbnails dropped for now** — no thumbnail upload handling; the create route no longer sets `thumbnailUrl` (column stays, seed still populates it, GET still returns it). Will add back later if needed.
- Signed-URL flow covers **binary** (private `dataset-binaries`, store path) and **sample** (public `dataset-samples`, store CDN URL) files.

**New files:**
- `src/lib/slugify.ts` — shared slugify, now the single source of truth (was duplicated in the route and `seed.ts`); the upload-url route, create route, and storage service must agree on the exact object key, so they all call this.
- `src/services/storage.service.ts` — `createDatasetUploadUrl` (mint signed URL), `isExpectedPath` (key matches title), `getStoredObject` (existence + size via `storage.info()`), `getSamplePublicUrl`. Service-role client, server-only.
- `src/app/api/v1/datasets/upload-url/route.ts` — the new step-1 endpoint (auth + Zod + mint URL).

**Changed:**
- `src/lib/validations/dataset.schema.ts` — `createDatasetSchema` reworked for JSON (added `binaryPath`/`samplePath`; numeric fields still coerce but now guard `null`/`''` → treated as absent, so a `null` price can't silently become a free `0`); added `uploadUrlSchema`.
- `src/app/api/v1/datasets/route.ts` — POST now JSON + storage verification (400 if a path mismatches or the file isn't in storage). Also fixed a latent bug: the response returned `dataset` with a `BigInt` `fileSizeBytes`, which `NextResponse.json` can't serialize — now cast to string.

**Deleted (dead/obsolete):**
- `src/services/upload.service.ts` — replaced by `storage.service.ts`; its through-the-server upload + gallery-image code is gone.
- `src/actions/upload.actions.ts` — obsolete (uploads no longer go through a server action; it was also unused).
- `src/lib/supabse/storage.ts` — dead duplicate of the upload logic, imported by nothing.

**Verified:**
- `tsc --noEmit` + `eslint` clean across `src/`
- Zod schemas unit-tested (`tsx`): JSON number + string price both accepted; missing/`null` price rejected (no silent `0`); currency default/normalize; tags array; `uploadUrlSchema` rejects bad `kind` / missing `fileName`
- Live dev server: `GET` still 200; `POST /upload-url` and `POST /datasets` both `401` without a session (auth runs before validation). Authenticated happy-path to be exercised via Thunder Client with the session cookie.

**Files changed:**
- `src/lib/slugify.ts` — NEW
- `src/services/storage.service.ts` — NEW
- `src/app/api/v1/datasets/upload-url/route.ts` — NEW
- `src/lib/validations/dataset.schema.ts`
- `src/app/api/v1/datasets/route.ts`
- `src/services/upload.service.ts` — DELETED
- `src/actions/upload.actions.ts` — DELETED
- `src/lib/supabse/storage.ts` — DELETED
- `docs/architecture-overview/api-contracts.md`, `docs/architecture-overview/system-design.md` — documented the two-step upload

---

## Session 3 — Day Summary (2026-06-23)

Built the complete backend data layer for the dataset marketplace: a paginated, filterable `GET /api/v1/datasets` endpoint for the public listing page, a role-gated `POST /api/v1/datasets` endpoint for sellers/admins to create listings (with a two-step signed-URL upload flow so file bytes never pass through the server), Zod validation schemas at every trust boundary (route handlers + server actions), a shared `auth.service.ts` that verifies identity via `getClaims()` (local JWT check — no network call) and resolves the app role from the DB, and a seed script that populates 10 realistic datasets + 3 test accounts (user/seller/admin). On the documentation side, created `auth.md` covering the full Supabase SSR session lifecycle, all 7 environment variables with a Mermaid flowchart showing which key is active at each step of the user journey, and the `getClaims()` vs `getUser()` vs `getSession()` decision framework.

### Admin Accessibility — Current State

| Layer | What Admin Can Do | How It's Enforced |
|---|---|---|
| **Proxy** (`proxy.ts`) | Access all protected routes (`/account/*`, `/admin/*`) | `getClaims()` checks session validity only — does NOT check role. Any authenticated user passes the proxy. |
| **Route: `POST /api/v1/datasets`** | Create dataset listings (same as seller) | `getSessionUser()` → 401 if no session, 403 if role ≠ `seller` or `admin`. Admin passes. |
| **Route: `POST /api/v1/datasets/upload-url`** | Get signed URLs for file uploads (same as seller) | Same `getSessionUser()` + role check. Admin passes. |
| **Server Actions** (`auth.actions.ts`) | Sign in, sign up, forgot/reset password | No role check — these are open to all users including admin. |
| **DB (RLS policies)** | `users` — admin can SELECT all rows; regular users only their own | Supabase RLS on the `users` table. |
| **DB (RLS policies)** | `datasets` — admin can INSERT/UPDATE/DELETE all; sellers only their own | Supabase RLS on the `datasets` table. |
| **DB (RLS policies)** | `orders`, `issues`, `meet_slots`, `meet_bookings` — admin has full access | Supabase RLS per table (scaffolded, not yet active in app code). |
| **Seed** | Test admin account: `admin@test.com` / `Test@1234` | Created by `prisma/seed.ts` → `supabase.auth.admin.createUser()` + `prisma.user.upsert({ role: 'admin' })`. |

**What admin CANNOT do yet (not built):**
- No admin dashboard UI — the `/admin/*` route prefix is protected by the proxy but no pages exist there yet
- No admin-specific API routes (e.g. list all users, manage all datasets, view analytics, resolve issues)
- No admin role assignment endpoint — role changes require direct DB update or seed re-run
- No admin-only columns in the API response (e.g. `binaryUrl` is excluded from the GET response for everyone)

---

## Session 4 — 2026-06-25

### 24. DodoPayments — Full Checkout + Webhook Flow (Implemented)

> Session 2 / entry #11 was a *plan*. This is the actual build. Detailed reference lives in `docs/dodopayments.md`; this is the running-log version.

**The flow, end to end:**

```
User clicks "Buy Now" on /datasets/[id]
  → POST /api/v1/checkout
      → check the user is logged in
      → read the dataset's price + dodoProductId FROM OUR DB (never trust the page)
      → block it if the user already bought this dataset
      → create an Order row (status: "pending")
      → ask Dodo to make a hosted checkout page
      → save Dodo's session id on the Order, return the checkout URL
  → browser redirects to Dodo's payment page (we don't build the card form)
  → user pays; discount codes are typed in on Dodo's page, Dodo does the maths
  → Dodo calls POST /api/v1/webhooks/dodo
      → verify it's really Dodo (signature check)
      → find the Order by the id we tucked into metadata
      → flip Order to "paid" (or "failed"), save the payment id + paid time
  → user lands back on /checkout/success — page reads the Order and shows the result
```

**Why the Order is created *before* payment (the "pending" row):** This is intentional and standard. We need a record to exist the moment checkout starts so the webhook has something to find and update later — Dodo only sends back the `orderId` we gave it, so the row has to pre-exist. A `pending` order just means "someone started checkout"; it only becomes `paid` when Dodo confirms the money actually moved. Abandoned/failed checkouts simply stay `pending` (or go `failed`) forever and are ignored — they're not real sales. So seeing `pending` rows pile up without payment is expected, not a bug.

**Each piece of code, in one line:**

| File | What it does |
|---|---|
| `src/lib/dodo.ts` | Sets up the Dodo client once (reads the API key from `.env`). |
| `src/lib/validations/checkout.schema.ts` | Checks the incoming request only contains a valid `datasetId`. |
| `src/services/payment.service.ts` | Talks to Dodo to create the hosted checkout page and hands back its URL. |
| `src/services/order.service.ts` | All the Order database work: create pending, mark paid, mark failed, block re-buys. Mark-paid/failed only act on a `pending` order, so if Dodo sends the same notification twice, the second one does nothing (no double-processing). |
| `src/app/api/v1/checkout/route.ts` | The "Buy" endpoint — ties the above together: login check → price lookup → make order → make Dodo session → return URL. |
| `src/app/api/v1/webhooks/dodo/route.ts` | The endpoint Dodo calls after payment — verifies it's genuine and updates the order. |
| `src/hooks/use-create-checkout.ts` | The front-end "click Buy → call our checkout API → redirect to Dodo" glue. |
| `src/components/checkout/buy-button.tsx` | The actual "Buy Now" button. |
| `src/app/(public)/datasets/[id]/page.tsx` | A single dataset's page — shows title, price, and the Buy button. |
| `src/app/(public)/datasets/page.tsx` | The browse page — lists all datasets, each links to its detail page. |
| `src/app/(public)/checkout/success/page.tsx` | Where the user lands after paying — reads the order and shows paid / still-confirming. |
| `src/lib/query-client.ts` + `src/components/providers/query-provider.tsx` | TanStack Query setup so the front-end can call our APIs cleanly. |

**Changed (not new):**
- `src/services/dataset.service.ts` — added `getDatasetById()` so the checkout route and detail page can load one dataset.
- `src/app/layout.tsx` — wrapped the app so TanStack Query works everywhere.
- `package.json` — added `@tanstack/react-query`.
- `prisma/seed.ts` — the first dataset now picks up `dodoProductId` from a new `DODO_TEST_PRODUCT_ID` env var (so we can link one real Dodo product for testing without code changes).

**Schema:** No migration needed — every column this uses (`Order.status`, `dodoSessionId`, `dodoPaymentId`, `paidAt`; `Dataset.price`, `dodoProductId`) already existed from Session 2 / entry #10.

**Why these tool choices** (full reasoning in `docs/dodopayments.md`):
- **Checkout** uses the raw Dodo SDK in our own route — so we can look up the real price and create the order *before* calling Dodo, instead of trusting whatever the browser sends.
- **Webhook** uses the ready-made `@dodopayments/nextjs` `Webhooks` handler — it already does the security signature check, so we don't hand-roll it.
- **Discounts** are Dodo's own coupon codes typed on Dodo's page — Dodo calculates the final amount, so our records always match what was actually charged.

**Still blocking a real end-to-end test (manual setup, not code):**
1. `DODO_PAYMENTS_WEBHOOK_KEY` is still empty in `.env` — get it from the Dodo dashboard (Webhooks → secret). The webhook route errors until this is filled in.
2. No dataset has a real `dodoProductId` yet — a Product must be created in the Dodo dashboard and its id put in `DODO_TEST_PRODUCT_ID`, then `npm run db:seed`. Until then, clicking Buy returns "This dataset is not available for purchase yet."
3. Local webhook testing needs an `ngrok` tunnel so Dodo can reach our machine. **Browse the app on `localhost` directly** — the ngrok URL is only for Dodo to call the webhook; opening the app *through* ngrok breaks Next.js dev hydration (the Buy button stops responding), which is a dev-only quirk, not a real bug.

**Verified so far:** type-check + lint clean; Buy works on `localhost`; unauthenticated checkout returns 401; webhook correctly rejects until the secret is set.

**Not built yet:** the actual file-download endpoint that checks an order is `paid` before letting the user download (and writes the `Download` audit row then) — that's the natural next step.

---

### 25. Datasets Browse Page

**Problem:** `src/app/(public)/datasets/page.tsx` was an empty placeholder — no way to see all datasets and click through to buy one.

**What was done:**
- Built the browse page as a Server Component: lists all published datasets in a card grid, each card links to `/datasets/[id]` (the detail + Buy page).
- Shows thumbnail, title, truncated description, category, language. Uses the existing `getPublishedDatasets` service (now via its cached wrapper — see #26).

**File:** `src/app/(public)/datasets/page.tsx`

---

### 26. Scale/Load Hardening — First Two Items

Reviewed the architecture for scale-readiness and shipped the two highest-impact, lowest-risk fixes. (Remaining recommendations — keyset pagination, API rate limiting, read replicas, observability — noted for later, not yet done.)

**1. Capped the DB connection pool (`src/lib/prisma.ts`) — the urgent one.**
- **Problem:** `new Pool(...)` had no `max`, so it defaulted to 10 connections. On Vercel every warm serverless instance keeps its own pool, so under load `10 × many instances` can exceed the Supabase pooler's client-connection limit → "too many connections" failures.
- **Fix:** `max` is now **1 in production, 10 in dev**, overridable via `DATABASE_POOL_MAX`. A serverless function handles one request at a time, so 1 connection per instance is enough (raise it only if Vercel Fluid Compute / concurrent invocations is enabled).

**2. Cached the dataset list (`src/services/dataset.service.ts`).**
- **Why:** dataset browsing is the highest-traffic, lowest-change path — every visit was hitting Postgres.
- **What:** added `getCachedPublishedDatasets`, wrapping the existing query in Next's `unstable_cache` with a **60s revalidate** + a `datasets` cache tag (`DATASETS_CACHE_TAG`). Both read paths now use it: the browse page (`/datasets`) and `GET /api/v1/datasets`. Repeated identical browse/filter requests now serve from cache and hit the DB at most once per 60s per unique filter+page combo.
- **Deliberately NOT cached:** `getDatasetById` — it returns `price` (Decimal) and `fileSizeBytes` (BigInt), which Next's cache can't serialize.
- **Cache busting:** left to the 60s window for now. Next 16 changed `revalidateTag` to take a cache-profile second arg; a `TODO` comment in the `POST /api/v1/datasets` create route shows exactly how to bust the tag (`revalidateTag(DATASETS_CACHE_TAG, 'max')`) once a "publish dataset" step exists. Skipped today because created datasets are unpublished, so they never appear in the cached public list anyway.

**Files changed:** `src/lib/prisma.ts`, `src/services/dataset.service.ts`, `src/app/(public)/datasets/page.tsx`, `src/app/api/v1/datasets/route.ts`

**Verified:** type-check + lint clean; `GET /api/v1/datasets` and `/datasets` both still return 200 with real data.

---

### 27. Upload = Live — Dodo Product Auto-Creation, `isPublished` Removal & Redis Exploration

Datasets now go live instantly upon upload — no separate publish step is needed anymore. The old publish/unpublish system was fully removed from the platform since it's no longer relevant. Additionally, Redis was explored as a caching layer on the backend to improve data loading speed and overall performance.

**1. Dodo Product auto-creation on dataset upload (`src/services/payment.service.ts`, `src/app/api/v1/datasets/route.ts`)**
- Added `createDatasetProduct()` to `payment.service.ts` — calls `dodo.products.create()` with `name = title`, `price` in cents, `digital_products` tax category.
- Wired into `POST /api/v1/datasets` — the route now creates a Dodo product first, then stores the returned `product_id` as `dataset.dodoProductId`. If Dodo fails, the request 502s cleanly with no orphan DB row.

**2. `isPublished` fully removed**
- **Schema + DB:** dropped the `is_published` column via migration `20260626120000_remove_dataset_is_published` (applied with `migrate deploy`, confirmed column gone from DB).
- **Service:** removed `isPublished: true` filter from `getPublishedDatasets()` — all datasets now returned.
- **Checkout route:** removed `!dataset.isPublished` guard — any dataset with a `dodoProductId` is purchasable.
- **Detail page:** removed `!dataset.isPublished` "not available" block.
- **Seed:** removed `isPublished: true` from all 10 seed datasets.

**3. Redis explored for caching**
- Researched Redis as a backend caching layer to complement the existing Next.js `unstable_cache` (60s TTL). Redis would enable shared cache across serverless instances, sub-millisecond lookups for hot paths (dataset list, filters), and explicit cache invalidation on dataset create/update. Not yet implemented — exploration phase only.

**Files changed:** `src/services/payment.service.ts`, `src/app/api/v1/datasets/route.ts`, `src/services/dataset.service.ts`, `src/app/(public)/datasets/[id]/page.tsx`, `src/app/api/v1/checkout/route.ts`, `prisma/seed.ts`, `prisma/schema/schema.prisma`, `prisma/migrations/20260626120000_remove_dataset_is_published/migration.sql`

**Verified:** migration applied; `is_published` column confirmed absent from DB; `tsc --noEmit` + `eslint` clean; dev server restarted; all read paths (`GET /api/v1/datasets` → 200, `/datasets` → 200, `/datasets/[id]` → 200) and checkout (`POST /api/v1/checkout` unauthenticated → 401) working correctly.

---

## Session 5 — 2026-06-29

### 28. Testing — Vitest + GitHub Actions CI

**What was done:**
- Added **Vitest** (`vitest.config.ts` resolves the `@/` alias to `src/`, matching `tsconfig.json`). Scripts: `npm test` (`vitest run`, used by CI), `npm run test:watch` (local dev).
- Wrote the first 3 test files, colocated next to the code they test (15 tests total):
  - `src/lib/slugify.test.ts` — lowercasing, punctuation stripping, whitespace collapsing, determinism.
  - `src/lib/validations/checkout.schema.test.ts` — valid uuid passes; missing/invalid/empty `datasetId` rejected; extra client-supplied fields (e.g. a forged `amount`) are stripped, never trusted.
  - `src/services/order.service.test.ts` — the highest-value one: mocks `@/lib/prisma` and pins the **webhook idempotency guard** — `markOrderPaid`/`markOrderFailed` must filter on `status: 'pending'` in their `updateMany` call, and a `count: 0` result (already-processed order, e.g. a retried Dodo webhook) must resolve quietly instead of throwing.
- Added `.github/workflows/ci.yml` — runs on every push/PR to `main`: checkout → Node → `npm ci` → `npm test`. Deliberately doesn't duplicate `tsc`/`eslint`, since Vercel's `next build` already runs both and fails the deployment on either.

**Bug found on the first real CI run (and fixed):** the very first push failed in ~30s, before any test ran. Root cause: `.env` is git-ignored (correctly — it holds real secrets), so it never reaches the GitHub Actions runner. `npm ci`'s `postinstall` hook runs `prisma generate`, which reads `prisma.config.ts` → `env("DIRECT_URL")` → throws `PrismaConfigEnvError` when the var doesn't exist at all, so `npm ci` itself failed — `npm test` never got a chance to run. Reproduced locally by temporarily hiding `.env` (verified restored byte-identical via `diff` afterward) to confirm the exact error before fixing it. Fix: added harmless **placeholder** `DIRECT_URL`/`DATABASE_URL` values (never a real secret — `prisma generate` only parses the schema, it doesn't connect) as job-level `env:` in `ci.yml`. Re-verified the full suite passes under the exact same no-`.env` conditions.

**Node version aligned:** CI was pinned to Node 20 (the `setup-node@v4` default), which doesn't match local dev (`node -v` → v24.15.0) and was already flagged by GitHub as deprecated for Actions runners. Bumped `ci.yml` to `node-version: 24`. Also updated `docs/deployment-checklist.md`'s Vercel Node.js version line to say "matches local dev / CI" instead of a stale `20.x`, so all three environments are called out as needing to stay in sync.

**Branch protection caveat discovered:** GitHub will create a branch protection rule requiring the CI status check, but won't *enforce* it (won't block the Merge button) on a private repo owned by an Organization unless the org is on a Team/Enterprise plan. Documented as a known limitation in `docs/deployment-checklist.md` — for now, the ❌/✅ on the PR is a manual gate rather than a hard block.

**Files changed:** `vitest.config.ts` (new), `package.json` (added `vitest` devDependency + `test`/`test:watch` scripts), `src/lib/slugify.test.ts` (new), `src/lib/validations/checkout.schema.test.ts` (new), `src/services/order.service.test.ts` (new), `.github/workflows/ci.yml` (new), `docs/deployment-checklist.md` (new "CI/CD Pipeline" section + checklist updates).

**Verified:** all 15 tests pass locally; `tsc --noEmit` + `eslint` clean on every new file; `npm ci --dry-run` confirms the lockfile is in sync; reproduced and fixed the real CI failure (confirmed via the same no-`.env` + placeholder-env-var conditions GitHub Actions runs under).

**Not done yet:** no test exists for the upcoming user-onboarding feature (doesn't exist in the codebase yet) — tests for it should follow the same priority order established here: validation-schema boundaries first, then any new state-transition/idempotency logic, then route-level auth/status-code checks; skip testing UI rendering details or framework behavior.

---

## Session 6 — 2026-07-23

### 29. `npm run db:sync-dodo` Fixed — ES Import Hoisting Broke Env Loading

**Problem:** `npm run db:sync-dodo` crashed immediately with `DodoPaymentsError: The DODO_PAYMENTS_API_KEY environment variable is missing or empty` — even though the key was present in **both** `.env` and `.env.local`.

**Root cause — ES module import hoisting (not a missing key):** `scripts/sync-dodo-products.ts` called `dotenv.config()` inline, written *above* the app imports with a comment claiming "BEFORE any app imports". But ES `import` statements are hoisted and evaluated before any inline statements in the same module. So the import chain — `sync-dodo-products.ts` → `payment.service.ts` → `@/lib/dodo` — ran first, and `src/lib/dodo.ts` instantiates the Dodo client at **module-eval time** (`export const dodo = ... ?? createDodoClient()`), reading `process.env.DODO_PAYMENTS_API_KEY` while it was still `undefined`. The `dotenv.config()` calls only ran afterward, too late.

**Fix:**
- **New file `scripts/load-env.ts`** — isolates `dotenv.config({ path: '.env.local' })` then `.env` (`.env.local` wins; dotenv keeps the first value it sees).
- **`scripts/sync-dodo-products.ts`** — replaced the inline dotenv block with `import './load-env'` as the **very first import**. Because imports evaluate in source order, the env is loaded before any `src/` module is pulled in.

**Rule established:** any standalone `tsx` script that touches modules which construct clients at load time must `import './load-env'` first — never rely on an inline `dotenv.config()` sitting above the imports. (Companion to the existing rule from #16: don't use the `@/` alias in scripts, it doesn't resolve outside the Next bundler.)

**Verified:** `npm run db:sync-dodo -- --dry-run` now loads env (`injected env (12) from .env.local`) and runs — found 16 datasets missing `dodoProductId` and processed them all, no API-key error.

**Files changed:**
- `scripts/load-env.ts` — NEW
- `scripts/sync-dodo-products.ts` — inline dotenv → `import './load-env'`

---

### 30. Dataset Samples Uploaded + Login/Payment-Gated Download Endpoints

**Goal:** buyers can download the **free sample** once **logged in**, and the **paid binary** only once **logged in AND payment complete**. (Installments are deferred — one-time payment only for now.)

**Part A — Sample files created & uploaded.** The 10→16 seeded datasets had `sampleUrl = null` (only "Multi-Language News Articles" had one, uploaded manually → `dataset-samples/archive.zip`, left untouched). Generated a small, theme-matched **preview** for each of the other **15** datasets and uploaded them to the public `dataset-samples` bucket at `samples/<slug>.<ext>`, then wrote the public CDN URL back to `dataset.sampleUrl`:
- Tabular / time-series (`.csv`, `.parquet`) → a ~10-row **CSV** preview with realistic columns.
- Text corpora (`.json`) → a ~6-record **JSON** preview.
- Binary formats (`.zip`, `.tiff`, DICOM) → a **CSV/JSON schema preview** (a raw binary chunk isn't a useful preview; the sample shows structure/labels instead).
- Scripts are idempotent (`upsert`) and skip the manually-set slug. Verified the public URLs return `200` (CSV rows + `application/json`).

**Part B — Two download endpoints (both new).**
- `GET /api/v1/datasets/[id]/sample` — **login-gated**. 401 if no session → 404 if dataset/sample missing → else `redirect` to the public `sampleUrl`. Samples stay in the **public** bucket (product decision): this gates the app's download path, not the object itself (a copied raw CDN URL is still reachable — the accepted trade-off for free previews).
- `GET /api/v1/datasets/[id]/download` — **login + paid-gated**. 401 if no session → 404 if dataset/binary missing → **403 if no `paid` Order** for this user+dataset (`findPaidOrder`) → signs a **60s** download URL for the **private** `dataset-binaries` object (`createSignedDownloadUrl`, `download: true`) → writes a `Download` audit row with the buyer's real IP → redirects. Audit-write failure is logged but never blocks a paying customer.

**Why the split (public sample vs private binary):** matches the existing storage design — `dataset-samples` is public (CDN preview), `dataset-binaries` is private (`binaryUrl` stores a path, signed on demand). The `Download` row is written here at real download time (not in the Dodo webhook) so `ipAddress`/`downloadedAt` reflect the buyer, not Dodo's servers.

**Note:** seeded datasets have `binaryUrl = null`, so the binary endpoint correctly 404s for them — only datasets uploaded through `POST /api/v1/datasets` have a binary to serve. Front-end "Download sample" / "Download" buttons are not built yet — these are the backend endpoints they'll call.

**Verified:** `tsc --noEmit` + `eslint` clean; dev server — both endpoints return `401` unauthenticated with the right messages; the new `[id]` dynamic segment does **not** shadow the static `datasets/upload-url` route (still its own `401`). Sample public URLs fetch `200`.

**Files changed:**
- `scripts/upload-samples.ts` — NEW (sample generation + upload + `sampleUrl` backfill)
- `scripts/inspect-samples.ts` — NEW (read-only state inspector)
- `src/services/storage.service.ts` — added `createSignedDownloadUrl()`
- `src/services/download.service.ts` — NEW (`recordDownload` audit writer)
- `src/app/api/v1/datasets/[id]/sample/route.ts` — NEW
- `src/app/api/v1/datasets/[id]/download/route.ts` — NEW

---

### 31. Detail-Page UI Wired to Sample/Buy/Download + Installments Removed

**Goal:** hook the dataset detail page's existing (static, un-wired) buttons up to the endpoints from #30, gated exactly like the API, and drop the installment option (one-time payment only for now).

**Server → client sync.** The detail page (`datasets/[id]/page.tsx`) is a Server Component, so it now resolves viewer state from the auth cookie and passes two booleans down to the pricing components:
- `isLoggedIn` = `getSessionUser(cookies())` present.
- `owned` = `findPaidOrder(user.id, dataset.id)` exists — the **same** paid-Order check the download endpoint enforces, so the button state can never disagree with what the API will allow. (Reading cookies makes the page dynamic/per-user, which is correct — ownership isn't cacheable.)

**New client hook** `src/hooks/use-dataset-actions.ts` — one place for the three actions, each gated before it hits the network so there's no flash of a raw JSON 401:
- `downloadSample` → navigates to `GET /datasets/[id]/sample` (login-gated); opens the sign-in modal first if logged out.
- `downloadDataset` → navigates to `GET /datasets/[id]/download` (login + paid).
- `buy` → existing `useCreateCheckout` mutation (login-gated) → Dodo checkout redirect.
Reuses the existing `useAuthModal` store (`open('sign-in')`) so the gate matches the navbar's auth flow.

**Component changes:**
- `pricing-sidebar.tsx` — **removed the Pay-in-full / Pay-in-installments toggle** (and its `payMode` state); now a single one-time-purchase price panel. Primary CTA is `owned ? "Download dataset" (green → downloadDataset) : "Buy now at $X" (→ buy, with pending/error states)`. "Download sample first" link → `downloadSample` (hidden when the dataset has no `sampleUrl`).
- `pricing-options.tsx` — became a client component; "Free Sample → Download sample" → `downloadSample` (disabled + "No sample available" when absent); the packet "Buy now" → `buy`, or "Download dataset" when `owned`.
- The sample route now appends Supabase's `?download=<name>` so the browser saves the file instead of rendering the CSV/JSON inline.

**Verified:** `tsc --noEmit` clean; dev server renders `/datasets/global-e-commerce-transactions-2024` → `200`; rendered HTML confirms `One-time` present, **`Pay in installments` gone**, `Buy now` + `Download sample` present, and `Download dataset` correctly absent for a logged-out viewer (owned = false).

**Known pre-existing issue (resolved in #32):** every component in `src/components/each-dataset/` typed its prop as `dataset: any`, an `@typescript-eslint/no-explicit-any` **error**. Cleaned up in #32 with a shared `DatasetDetail` type.

**Files changed:**
- `src/app/(public)/datasets/[id]/page.tsx` — compute `isLoggedIn` + `owned`, pass to pricing components; removed dead `CheckIcon`
- `src/hooks/use-dataset-actions.ts` — NEW
- `src/components/each-dataset/pricing-sidebar.tsx` — installments removed, actions wired
- `src/components/each-dataset/pricing-options.tsx` — client component, actions wired
- `src/app/api/v1/datasets/[id]/sample/route.ts` — force attachment download

---

### 32. Typed the `each-dataset` Components + Verified Every Dataset's Dodo Product

**A — `dataset: any` → `DatasetDetail`.** Every component in `src/components/each-dataset/` typed its prop as `any` (5 `no-explicit-any` **errors** + 2 unused-var warnings across the folder). Added a shared `DatasetDetail` type in `src/types/dataset.ts` — derived from the Prisma `Dataset` via `Omit`, overriding only the fields the server component's `JSON.parse(JSON.stringify(...))` changes (BigInt→number, Decimal→string, Date→ISO string) — so it can't drift from the schema. Applied it to `heading`, `specifications`, `pricing-sidebar`, `pricing-options`. `data-quality` never read its prop, so the prop was removed (and the page call updated); also dropped its unused `React` import and the unrelated unused `err` binding in `enterprise-consultation`. **The whole folder + page now lint clean (0 errors/warnings).**

**B — Dodo product verification.** New `scripts/verify-dodo-products.ts` checks that every dataset's `dodoProductId` is set AND actually resolves in Dodo (`dodo.products.retrieve`), (re)creating any that are missing or stale/invalid. Ran it: **all 16 datasets already have valid, resolvable product ids** (`pdt_...`), so nothing was recreated — confirming the earlier `db:sync-dodo` did populate them.

**Note (broader lint debt, out of scope):** a full-project `eslint .` still reports ~6 pre-existing errors in unrelated files (`site-navbar.tsx` set-state-in-effect, `saved-datasets.tsx` / `submit-requirements-section.tsx` unescaped entities, `search-datasets`). Not touched — separate from this task.

**Files changed:** `src/types/dataset.ts`, `src/components/each-dataset/{heading,specifications,data-quality,pricing-sidebar,pricing-options,enterprise-consultation}.tsx`, `src/app/(public)/datasets/[id]/page.tsx`, `scripts/verify-dodo-products.ts` (new).

---

### 33. Fixed the Checkout 500 (`sunbit`), Auth-Gated Price, Success-Page Auto-Refresh

**A — Checkout was 500ing for every dataset (critical).** `POST /api/v1/checkout` failed with a Dodo **422 `INVALID_REQUEST_BODY`** — `allowed_payment_method_types` in `payment.service.ts` listed `sunbit`, which is **not a valid Dodo variant**, so Dodo rejected the entire body (an unknown variant fails deserialization before anything else). Removed `sunbit`; the remaining variants (`upi_collect`, `upi_intent`, `credit`, `debit`, `klarna`, `afterpay_clearpay`, `billie`) are all valid. **Verified live:** a real (test_mode) `createCheckoutSession()` call now returns a `checkout_url` + `session_id` — the 422 is gone.

**B — Payment → order → success flow (verified end-to-end wiring).** Already correct once (A) was fixed: checkout sets `return_url = /checkout/success?orderId=…`; the `@dodopayments/nextjs` webhook `onPaymentSucceeded` → `markOrderPaid` flips the Order to `paid` (`dodoPaymentId`, `paidAt`) idempotently; `DODO_PAYMENTS_WEBHOOK_KEY` is now set in env. Enhancements: the success page now **auto-refreshes** (new `auto-refresh.tsx` client component calls `router.refresh()` every 3s for ~30s while the Order is still `pending`) so "Payment confirmed" appears without a manual reload, and shows a "Go to dataset to download" link. Fixed a latent bug: both the success link and the checkout `cancelUrl` pointed at `/datasets/{uuid}`, but the detail page routes by **slug** — now resolve/use `dataset.slug`. (Local end-to-end still needs an ngrok tunnel so Dodo can reach the webhook — pre-existing, documented.)

**C — Price is now auth-gated.** Per the requirement "only send the price from the DB when the user is logged in": the detail page (`datasets/[id]/page.tsx`) now **strips `price` to `null` for logged-out viewers** before serializing (the real number never reaches the client) and also drops the private `binaryUrl` from the client payload entirely. The pricing UI (`pricing-sidebar`, `pricing-options`) shows a **blurred placeholder + "Sign in to view price"** (opens the auth modal via a new `promptSignIn` from `use-dataset-actions`) and the CTA reads "Sign in to buy" when logged out. **Verified:** logged-out render of a $89.99 dataset contains no `89.99` and shows the sign-in prompts. Price only ever appeared on the detail page — browse cards don't render it (`CARD_SELECT` has no price) — so no other surface needed changes.

**Verified:** `tsc --noEmit` clean; all changed files lint clean; live Dodo checkout session succeeds; logged-out detail page hides the real price.

**Files changed:** `src/services/payment.service.ts`, `src/app/api/v1/checkout/route.ts`, `src/app/(public)/checkout/success/page.tsx`, `src/app/(public)/checkout/success/auto-refresh.tsx` (new), `src/app/(public)/datasets/[id]/page.tsx`, `src/components/each-dataset/{pricing-sidebar,pricing-options}.tsx`, `src/hooks/use-dataset-actions.ts`.

---

### 34. Secure Success Page — Server-Side Dodo Verification + Post-Purchase Download

**Problem:** After a real payment, the success page stayed stuck on "Finishing up your payment…" even though Dodo's redirect carried `status=succeeded&payment_id=pay_…`. Cause: locally Dodo **can't reach the webhook** (no tunnel), so `markOrderPaid` never ran and the page (which only read `Order.status`) never flipped. It also didn't check that the order belonged to the viewer.

**Fix — verify with Dodo on the success page, gated three ways.** New `finalizePurchase({ orderId, userId, paymentId })` in `order.service.ts`:
1. **Ownership** — the order must belong to `userId` (a guessed/leaked `orderId`, or another user's, is refused — verified: wrong user → `authorized: false`).
2. **Payment authenticity** — if not already `paid`, retrieve the payment from Dodo (`retrievePayment` → `dodo.payments.retrieve`) and require `status === 'succeeded'` **and** its `metadata.orderId`/`metadata.userId` (set by us at checkout) to match this exact order + user. A forged `payment_id`/`status` in the URL can't unlock anything.
3. Only then `markOrderPaid` (idempotent — safe alongside the webhook).

The success page (`checkout/success/page.tsx`) was rewritten: requires a session → runs `finalizePurchase` → and **only when confirmed** renders "Payment confirmed" + a **Download dataset** link (`/api/v1/datasets/[id]/download`) plus nav buttons (View dataset / Browse more / Back home). Logged-out or unauthorized viewers get a sign-in / "order not found" shell with no download. This makes the page self-sufficient without the webhook, while the webhook stays the authoritative async path in prod.

**Placeholder binaries so the download actually serves a file.** Seeded datasets had `binaryUrl = null` (no real file). New `scripts/seed-binaries-from-samples.ts` copies each dataset's public **sample** into the private `dataset-binaries` bucket at `datasets/<slug>.<ext>` and sets `binaryUrl` (+ `fileSizeBytes`). So **for now the "main dataset" download === the sample content** — swap in real binaries later by re-uploading. Ran it: all 16 datasets seeded.

**Verified end-to-end with the real order from the screenshot:**
- `finalizePurchase` → `authorized: true, paid: true`; wrong user → `authorized: false`.
- Success page unauthenticated → shows "Please sign in", **no** download link (even with valid `orderId`/`payment_id` in the URL).
- Signing the private binary returns **HTTP 200, `Content-Disposition: attachment`**, real CSV content — i.e. a paid user can download the full file.
- `tsc --noEmit` + `eslint` clean on all changed files.

**Files changed:**
- `src/services/order.service.ts` — `finalizePurchase()` (ownership + Dodo verify + mark paid)
- `src/services/payment.service.ts` — `retrievePayment()`
- `src/app/(public)/checkout/success/page.tsx` — rewritten (auth + verify + download + nav)
- `scripts/seed-binaries-from-samples.ts` — NEW (sample → private binary stopgap)

---

### 35. Instant Auth — Client-Side Sign-In/Verify + Stay-on-Route Logout

**Problem:** login/signup felt jittery and the logged-in state lagged — the "My profile" button (and the auth-gated price) appeared a beat *after* success. **Cause:** sign-in and signup-OTP-verify ran through **server actions** using the *server-side* Supabase client. The browser's Supabase client therefore never observed the login, so the navbar's `onAuthStateChange` never fired — the header only updated after a full `router.refresh()` server round-trip (a second sequential hop after the action). So nothing was "instant".

**Fix — do the session-establishing auth on the browser client:**
- `sign-in-form.tsx` — `onSubmit` now calls `supabase.auth.signInWithPassword` on a per-mount browser client (was the `signIn` server action). The session updates locally → `onAuthStateChange` fires → the navbar flips to "My profile" **immediately**; `router.refresh()` then updates server-rendered bits (the gated price) in the background.
- `sign-up-form.tsx` `OtpStep` — `handleConfirm` now calls `supabase.auth.verifyOtp({ type: 'signup' })` on the browser client (was `verifySignupOtp`), so the session establishes the instant the code is confirmed. Followed by a best-effort `syncSignupName()` server action.
- `auth.actions.ts` — replaced `verifySignupOtp` with `syncSignupName()`: the OTP verify moved to the client, so this server action just seeds `full_name` from the email prefix (for users who skip the profile step), reading the cookie the browser client set. Removed the now-unused `signupOtpSchema` import. (The `signIn` server action is left in place, now unused, as a valid server-side option.)

**Route preservation** was already correct (forms `close()` + `router.refresh()`, no redirect) — the client-side switch just makes it *feel* instant, confirming the user never leaves the route.

**Logout now stays on the current route** (per follow-up): the navbar logout was `window.location.href = '/'` (hard redirect home). Now `supabase.auth.signOut()` → `onAuthStateChange` drops the header to "Get started" instantly → `setActiveMenu(null)` + `router.refresh()` — the user stays put and only the session is released. (On a protected route like `/profile`, the refreshed server render redirects away as before — correct.)

**Verified:** `tsc --noEmit` clean; all changed files lint clean (the `site-navbar.tsx` set-state-in-effect error and the `watch()` compiler note are pre-existing, unrelated); home/`/datasets`/detail all render `200` with no compile errors. (The instant navbar update is a client-runtime behavior — validated by the architecture: client-side auth → `onAuthStateChange` → immediate `setUser`.)

**Files changed:** `src/components/auth/sign-in-form.tsx`, `src/components/auth/sign-up-form.tsx`, `src/actions/auth.actions.ts`, `src/components/layout/site-navbar.tsx`.
