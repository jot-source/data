# Tech Stack Decisions — Dataset Marketplace

> Last updated: June 2025

Each decision includes: what was chosen, why it was chosen, what alternatives were considered, and when the decision was made.

---

## Stack Summary

| Layer | Technology | Decision Date |
|---|---|---|
| Framework | Next.js 16 (App Router) | June 2025 |
| Language | TypeScript | June 2025 |
| Styling | Tailwind CSS + Shadcn/UI + and custom components | June 2025 |
| Auth | Supabase Auth | June 2025 |
| Database | Supabase PostgreSQL | June 2025 |
| ORM | Prisma 6 | June 2025 |
| File Storage | Supabase Storage + CDN | June 2025 |
| Server State | TanStack Query | June 2025 |
| Client State | Zustand | June 2025 |
| Forms & Validation | React Hook Form + Zod | June 2026 |
| Payments | Dodo Payments | June 2025 (Future — Epic 3) |
| Email | Nodemailer | June 2025 |
| Logging | Pino | June 2025 |
| Deployment | Vercel | June 2025 |

---

## Decision Records

### Framework — Next.js 16 (App Router)

| | |
|---|---|
| **Decision** | Next.js 16 with App Router |
| **Why** | RSC (React Server Components) allow server-side data fetching with zero client bundle cost. File-based routing. Built-in API route handlers. First-class Vercel deployment. |
| **Alternatives** | Remix (good but less ecosystem maturity), Vite + React (no SSR out of the box), SvelteKit (team unfamiliar) |
| **Date** | June 2025 |

---

### Language — TypeScript

| | |
|---|---|
| **Decision** | TypeScript (strict mode) |
| **Why** | End-to-end type safety from DB schema (Prisma-generated types) to API responses to UI components. Catches bugs at compile time. |
| **Alternatives** | JavaScript (no type safety, rejected outright) |
| **Date** | June 2025 |

---

### Styling — Tailwind CSS + Shadcn/UI

| | |
|---|---|
| **Decision** | Tailwind CSS for utilities + Shadcn/UI for accessible component primitives |
| **Why** | Utility-first approach keeps styles co-located with components. Shadcn/UI provides accessible, unstyled primitives that we own (not a library dependency). |
| **Alternatives** | CSS Modules (verbose), Emotion/styled-components (runtime overhead), MUI (opinionated, hard to customize) |
| **Date** | June 2025 |

---

### Auth — Supabase Auth

| | |
|---|---|
| **Decision** | Supabase Auth |
| **Why** | Email/password, magic link, and OAuth all built in. Same platform as our DB — no separate auth service to manage. Session handled via cookies, compatible with Next.js middleware. |
| **Alternatives** | NextAuth.js (more config, separate session management), Clerk (paid, vendor lock-in), Auth0 (pricing at scale) |
| **Date** | June 2025 |

**Implementation notes:**
- Admin is a `role` flag on the `users` table — no separate admin auth flow
- Session cookie read in `middleware.ts` on every request
- Guest browsing is fully public; login wall appears only at purchase or sample download

---

### Database — Supabase PostgreSQL

| | |
|---|---|
| **Decision** | Supabase PostgreSQL |
| **Why** | Same platform as auth. Row-Level Security (RLS) built in for data protection. Generous free tier. S3-compatible storage included. No separate database service to manage. |
| **Alternatives** | PlanetScale (MySQL, no RLS), Neon (PostgreSQL but separate from auth), Railway (more DevOps overhead) |
| **Date** | June 2025 |

---

### ORM — Prisma 6

| | |
|---|---|
| **Decision** | Prisma 6 |
| **Why** | Type-safe DB client generated from schema. Migrations tracked in version control. Schema is the single source of truth. Excellent TypeScript integration. |
| **Alternatives** | Drizzle (lighter but less mature tooling), Kysely (query builder not ORM), raw SQL (no type safety) |
| **Date** | June 2025 |

**Key rules:**
- Always use `prisma migrate dev` — never mix with `db push` in a tracked project
- All DB access goes through `services/` only — no raw Prisma calls anywhere else

---

### File Storage — Supabase Storage + CDN

| | |
|---|---|
| **Decision** | Supabase Storage with Cloudflare CDN |
| **Why** | S3-compatible, same platform as DB and auth. All public assets automatically routed through Cloudflare's global CDN — zero extra configuration. Private signed URLs for paid content. |
| **Alternatives** | AWS S3 directly (more config, separate billing), Cloudinary (image-only, no binary storage), uploadthing (less control) |
| **Date** | June 2025 |

**Bucket strategy:**

| Bucket | Public? | Use |
|---|---|---|
| `dataset-images` | ✅ Public CDN | Thumbnails + gallery images |
| `dataset-samples` | ✅ Public CDN | Free preview files |
| `dataset-binaries` | ❌ Private | Full datasets, signed URL only, 1h TTL |

---

### Server State — TanStack Query v5

| | |
|---|---|
| **Decision** | TanStack Query v5 |
| **Why** | Automatic caching, background refetch, and mutation invalidation. Prevents stale data without manual management. Works seamlessly with RSC — server fetches initial data, client hydrates via TanStack Query. |
| **Alternatives** | SWR (similar but less feature-rich), Redux Toolkit Query (too heavy), manual fetch + useEffect (no caching) |
| **Date** | June 2025 |

**Config:**
```ts
// lib/query-client.ts
staleTime: 1000 * 60 * 5,   // 5 min — datasets don't change every second
gcTime:    1000 * 60 * 10,  // 10 min garbage collection
retry: 2
```

---

### Client State — Zustand

| | |
|---|---|
| **Decision** | Zustand |
| **Why** | Minimal boilerplate for UI-only state. No providers needed. Perfect for filter sidebar open/close, modal state, and pending filter selections. |
| **Alternatives** | Redux (massive boilerplate), Jotai (atom-based, similar size but less familiar), Context API (re-renders entire tree) |
| **Date** | June 2025 |

> **Rule:** TanStack Query for anything from the API/DB. Zustand for UI-only state that never touches the server. Never put server data in Zustand.

---

### Forms & Validation — React Hook Form + Zod

| | |
|---|---|
| **Decision** | React Hook Form (`react-hook-form`) + `@hookform/resolvers/zod`, schemas in `src/validations/*.schema.ts` |
| **Why** | The Zod schema is the single source of truth for both the client form and the server action. RHF removes per-field `useState`/manual `validate()`/error-mapping boilerplate, uses uncontrolled inputs (fewer re-renders), and gives `formState.errors`, `isSubmitting`, and `setError('field'\|'root')` for server/OAuth errors out of the box. |
| **Alternatives** | Formik (heavier, more re-renders), manual `useState` + `safeParse` (boilerplate per form) |
| **Date** | June 2026 |

> **Pattern:** `useForm({ resolver: zodResolver(schema) })` → `register('field')` →
> `errors.field?.message`. Reference: `src/components/auth/sign-in-form.tsx`. Error
> message strings live in the schema so client + server validation stay in sync.

---

### Payments — Dodo Payments _(Future — Epic 3)_

| | |
|---|---|
| **Decision** | Dodo Payments |
| **Why** | Simple API, good webhook support, supports subscriptions. Competitive pricing. Hosted checkout page reduces PCI compliance scope. |
| **Alternatives** | Stripe (more complex, higher fees at lower volume), Paddle (subscription-focused), LemonSqueezy (less control) |
| **Date** | June 2025 |

---

### Email — Nodemailer

| | |
|---|---|
| **Decision** | Nodemailer |
| **Why** | Simple, well-tested Node.js email library. Works with any SMTP provider. No vendor lock-in. Used for contact form emails and purchase receipts. |
| **Alternatives** | Resend (nice DX but paid), SendGrid (pricing), AWS SES (more setup) |
| **Date** | June 2025 |

---

### Logging — Pino

| | |
|---|---|
| **Decision** | Pino |
| **Why** | Fastest Node.js logger. Structured JSON output — easy to ship to any log aggregator (Datadog, Logtail, etc.). Low overhead in production. Pretty-prints in development. |
| **Alternatives** | Winston (slower, more config), console.log (no structure, unusable in production) |
| **Date** | June 2025 |

---

### Deployment — Vercel

| | |
|---|---|
| **Decision** | Vercel |
| **Why** | Zero-config Next.js deployment. Automatic preview deployments per PR. Edge functions support. Global CDN. |
| **Alternatives** | Railway (more control, more config), Fly.io (great for non-Next.js), AWS (too much DevOps) |
| **Date** | June 2025 |
