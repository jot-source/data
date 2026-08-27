# System Design — Dataset Marketplace

> Last updated: June 2025

---

## Project Goal

A full-featured e-commerce marketplace where users browse, filter, preview, purchase, and download datasets. Built to be deeply modular — every layer (auth, storage, payments, logging, state) is isolated behind its own abstraction so any piece can be swapped or extended without rippling changes across the codebase.

---

## MVP Scope — Epics

| Epic | Feature | MVP Status |
|---|---|---|
| Epic 0 | Landing Page | ✅ In Scope |
| Epic 1 | User Onboarding — register, login, profile | ✅ In Scope |
| Epic 2 | Search & Discovery — browse, filter, detail page | ✅ In Scope |
| Epic 3 | Payments via Dodo — test packets, full purchase, subscriptions | 🔮 Future |
| Epic 5 | Admin Panel — approve/reject listings | 🔮 Future |
| Epic 6 | Post Purchase — order history, download access | 🔮 Future |
| Epic 7 | Messaging Chatbot — predefined Q&A + escalation | 🔮 Future |
| Epic 8 | Coupons — buyer entry + admin management | 🔮 Future |
| Epic 9 | Add to Cart — multi dataset checkout | 🔮 Future |

> **MVP = Epic 0 + 1 + 2 only.** Everything else is scaffolded in the DB and folder structure now so future epics slot in cleanly — no refactoring needed.

---

## High-Level Architecture

### Request Flow

```
User Browser
  ↓
Next.js App Router
  ├── React Server Components  →  fetch on server, no client bundle cost
  └── Client Components        →  TanStack Query for data, Zustand for UI state
        ↓
  Server Actions / Route Handlers
        ↓
  Service Layer
  (dataset.service.ts / order.service.ts / download.service.ts …)
        ↓
  Prisma ORM
        ↓
  Supabase PostgreSQL
```

### File / Asset Flow

Files are uploaded **directly from the browser to Supabase Storage** — never through the Next.js server (Vercel caps function request bodies at a few MB, and dataset binaries can be multi-GB).

```
Seller/Admin: POST /api/v1/datasets/upload-url   (auth + role check)
  ↓  server mints a short-lived signed upload URL (service-role key)
Browser uploads the file bytes DIRECTLY to Supabase Storage via that URL
  ↓  bucket: dataset-binaries (private) | dataset-samples (public)
Browser: POST /api/v1/datasets  with metadata + storage paths (JSON, no bytes)
  ↓  server verifies each path exists in storage, then writes the row
URL/path stored in PostgreSQL  →  public assets served from Cloudflare CDN edge
```

> Binaries stay in a **private** bucket (store the path, sign a download URL at purchase time). Samples go in a **public** bucket (store the permanent CDN URL). Thumbnails are not wired up yet.

### Payment Flow _(Future — Epic 3)_

```
User clicks Buy  →  POST /api/checkout  →  Dodo Payments session
  ↓
Dodo hosted checkout page
  ↓
POST /api/webhooks/dodo  →  verify signature  →  upsert Order (status=paid)
  →  Pino logs event  →  Nodemailer sends receipt  →  download unlocked
```

---

## Supabase — Auth, Storage & CDN

### Auth

- **Email/password with 8-digit OTP** (signup confirm + password reset — no magic links) **and Google OAuth**, via Supabase Auth. Full detail: [../auth.md](../auth.md)
- Role is a `text` field on the `users` table — three values: `'user'`, `'seller'`, `'admin'`
- `proxy.ts` (the renamed middleware) reads the Supabase session cookie on every request and gates `/admin/*` and `/account/*`, redirecting to `/login?next=…` when absent
- Guest browsing is fully public — login wall appears only at purchase or sample/download
- Role/ownership checks happen **in the route/action layer** via `getSessionUser` (not the proxy, which only checks that a session exists)
- Sellers get dataset management on top of regular user access *(create/upload built; broader seller tooling is future)*

### How the Supabase CDN Works

Supabase Storage is built on top of AWS S3 but routes all traffic through **Cloudflare's global CDN** automatically. You don't configure anything — it's on by default.

```
User requests image
  ↓
Cloudflare edge node (nearest to user)
  ├── Cache HIT  →  served instantly from edge, zero origin cost
  └── Cache MISS →  fetches from Supabase S3 origin, caches for next request
```

- **Public buckets** → permanent CDN URLs, aggressively cached, no auth header needed
- **Private buckets** → Supabase generates a signed URL on demand (you control TTL), CDN does not cache these

This means thumbnails and sample files are globally fast with zero extra setup. Dataset binaries stay private and are never cached at the edge.

### Storage Buckets

| Bucket | Visibility | Purpose |
|---|---|---|
| `dataset-images` | Public CDN | Thumbnails + gallery images |--> i have moved the images to the database only not the storage for now 
| `dataset-samples` | Public CDN | Free preview files, no login needed |
| `dataset-binaries` | Private | Full datasets, signed URL only, 1h TTL |

### Row-Level Security (RLS) — ⚠️ future work, not yet implemented

> Role-based RLS is **not implemented yet** — work so far focused on the `user`
> role. Authorization today is enforced in the **application layer**
> (`getSessionUser` + role/ownership checks in each route), **not** by Postgres
> policies. See [db-schema.md → Authorization: Current State vs. Future Work](db-schema.md)
> for the full plan (custom access-token hook to expose the app role, service-role
> for webhook/audit writes, etc.).

**Target policies once RLS is enabled** (design draft — the owner column on `datasets` is `uploaded_by_user_id`, not `seller_id`):

- `datasets` — anyone can SELECT; `uploaded_by_user_id = auth.uid()` or `role=admin` can INSERT/UPDATE their own; only admin can DELETE
- `orders` — `auth.uid() = user_id` for SELECT/INSERT; status UPDATE only via service role (webhook)
- `downloads` — `auth.uid() = user_id` for SELECT; INSERT only via service role (download route)
- `saved_datasets` — `auth.uid() = user_id` for SELECT/INSERT/DELETE
- `users` — users read/update their own row only; admin can read all
- `meet_slots` / `meet_bookings` / `issues` — *(planned tables, not in the schema yet — see db-schema.md)*

---

## Folder Structure

```
src/

├── app/
│   ├── (public)/
│   │   ├── page.tsx                     # Epic 0 — Landing page
│   │   ├── datasets/
│   │   │   ├── page.tsx                 # Epic 2 — Listing + filters
│   │   │   └── [slug]/page.tsx          # Epic 2 — Detail page
│   │   ├── about/page.tsx
│   │   └── contact/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx               # Epic 1
│   │   └── signup/page.tsx              # Epic 1
│   ├── profile/                         # Protected — role-based dashboards
│   │   ├── layout.tsx                   # Shared shell with role-aware sidebar nav
│   │   ├── user/page.tsx                # Orders, downloads, issues, meets
│   │   ├── seller/page.tsx              # Listings, revenue, issues, meet slots
│   │   └── admin/page.tsx               # Analytics, all issues, all meets, all datasets
│   ├── schedule/
│   │   └── [hostId]/page.tsx            # Public Calendly-style booking page for a host
│   ├── account/                         # Protected — Epic 6 (Future)
│   │   ├── page.tsx
│   │   ├── orders/page.tsx
│   │   └── downloads/page.tsx
│   ├── admin/                           # Protected — Epic 5 (Future)
│   │   ├── page.tsx
│   │   └── datasets/
│   │       ├── page.tsx
│   │       ├── create/page.tsx
│   │       └── [id]/page.tsx
│   └── api/
│       ├── datasets/route.ts
│       ├── upload/route.ts
│       ├── contact/route.ts
│       ├── profile/
│       │   └── me/route.ts              # GET + PATCH own profile
│       ├── schedule/
│       │   ├── [hostId]/
│       │   │   ├── slots/route.ts       # GET available slots / POST new slot
│       │   │   └── book/route.ts        # POST — book a slot
│       │   ├── slots/[id]/route.ts      # DELETE a slot
│       │   └── bookings/
│       │       ├── mine/route.ts        # GET my bookings
│       │       └── [id]/route.ts        # PATCH booking status
│       ├── issues/
│       │   ├── route.ts                 # GET all (admin) / POST new issue
│       │   ├── mine/route.ts            # GET my reported issues
│       │   ├── assigned/route.ts        # GET issues assigned to me
│       │   └── [id]/route.ts            # GET single / PATCH issue
│       ├── admin/
│       │   └── analytics/route.ts       # GET platform-wide stats (admin only)
│       ├── checkout/route.ts            # Epic 3 (Future)
│       ├── download/[id]/route.ts       # Epic 6 (Future)
│       └── webhooks/
│           └── dodo/route.ts            # Epic 3 (Future)

├── components/
│   ├── ui/                              # Shadcn primitives — never edited directly
│   ├── layout/
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   ├── profile/
│   │   ├── profile-header.tsx           # Avatar, name, role badge
│   │   ├── order-history-table.tsx      # Used on user + admin profile
│   │   ├── dataset-listings-table.tsx   # Used on seller + admin profile
│   │   ├── issues-list.tsx              # Shared — filters by reported/assigned
│   │   └── analytics-cards.tsx          # Admin stats cards
│   ├── schedule/
│   │   ├── calendar-grid.tsx            # Monthly calendar — highlights days with slots
│   │   ├── slot-picker.tsx              # Time slots for a selected day
│   │   ├── booking-form.tsx             # Topic, notes, submit
│   │   └── slot-manager.tsx             # Seller/admin: create/delete their slots
│   ├── dataset/
│   │   ├── dataset-card.tsx
│   │   ├── dataset-grid.tsx
│   │   ├── dataset-filters.tsx          # 'use client' — reads URL search params
│   │   ├── dataset-filter-sidebar.tsx   # 'use client' — Zustand for open/close
│   │   ├── dataset-gallery.tsx
│   │   └── dataset-details.tsx
│   ├── checkout/                        # Epic 3 (Future)
│   │   ├── buy-button.tsx
│   │   └── download-button.tsx
│   ├── forms/
│   │   ├── dataset-form.tsx
│   │   └── contact-form.tsx
│   └── sections/
│       ├── hero.tsx
│       ├── featured-datasets.tsx
│       └── testimonials.tsx

├── store/                               # Zustand stores
│   ├── filter.store.ts
│   └── ui.store.ts

├── actions/
│   ├── dataset.actions.ts
│   ├── order.actions.ts                 # Epic 3/6 (Future)
│   ├── upload.actions.ts
│   ├── schedule.actions.ts              # Create/delete slots, confirm/cancel bookings
│   └── issue.actions.ts                 # Open, update, assign issues

├── services/
│   ├── dataset.service.ts
│   ├── order.service.ts                 # Epic 3/6 (Future)
│   ├── download.service.ts              # Epic 6 (Future)
│   ├── upload.service.ts
│   ├── contact.service.ts
│   ├── profile.service.ts               # Aggregate profile data by role
│   ├── schedule.service.ts              # Slot + booking DB operations
│   └── issue.service.ts                 # Issue CRUD + status transitions

├── lib/
│   ├── prisma.ts                        # Prisma singleton
│   ├── query-client.ts                  # TanStack Query client config
│   ├── supabase/
│   │   ├── client.ts                    # Browser Supabase client
│   │   ├── server.ts                    # Server Supabase client (cookies)
│   │   └── middleware.ts                # Session refresh + route guard
│   ├── dodo.ts                          # Dodo Payments SDK wrapper (Epic 3)
│   ├── storage.ts                       # Supabase Storage helpers
│   ├── mailer.ts                        # Nodemailer
│   └── logger.ts                        # Pino instance

├── hooks/
│   ├── use-datasets.ts                  # TanStack Query — dataset list
│   ├── use-dataset.ts                   # TanStack Query — single dataset
│   ├── use-orders.ts                    # TanStack Query — Epic 6
│   ├── use-profile.ts                   # TanStack Query — own profile + role data
│   ├── use-schedule.ts                  # TanStack Query — slots + bookings
│   ├── use-issues.ts                    # TanStack Query — issues list
│   └── use-auth.ts                      # Supabase Auth helpers

├── types/
│   ├── dataset.ts
│   ├── order.ts
│   ├── user.ts
│   ├── schedule.ts                      # MeetSlot, MeetBooking types
│   ├── issue.ts                         # Issue types
│   └── api.ts                           # Shared ApiResponse<T> wrapper

├── constants/
│   ├── routes.ts
│   └── app.ts

└── utils/
    ├── format-date.ts
    ├── slugify.ts
    └── pagination.ts
```

---

## State Management

Two tools, strict separation — they never overlap.

### TanStack Query v5 — Server State

Anything that touches the API or DB goes through TanStack Query.

| Hook | What it fetches |
|---|---|
| `useDatasets(filters)` | Paginated dataset list with active filters |
| `useDataset(slug)` | Single dataset detail |
| `useOrders()` | User purchase history _(Epic 6)_ |
| `useDownloads()` | User download history _(Epic 6)_ |
| `useProfile()` | Own profile + role-specific aggregated data |
| `useSchedule(hostId)` | Available slots for a host (calendar data) |
| `useMyBookings()` | Upcoming meets I've booked or am hosting |
| `useIssues(filter)` | Issues list — filtered by mine/assigned/all |

Mutations (`useMutation`) call server actions or route handlers, then call `queryClient.invalidateQueries` so the UI re-fetches fresh data automatically.

**Key config:**

```ts
// lib/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min — datasets don't change every second
      gcTime: 1000 * 60 * 10,     // 10 min garbage collection
      retry: 2,
    },
  },
})
```

### Zustand — Client UI State

Pure UI state that never touches the server.

```ts
// store/filter.store.ts
interface FilterStore {
  sidebarOpen: boolean
  pendingFilters: DatasetFilters   // in-progress selection before "Apply"
  toggleSidebar: () => void
  setPendingFilter: (key, value) => void
  resetFilters: () => void
}
```

| Store | Manages |
|---|---|
| `filter.store.ts` | Sidebar open/closed, pending filter state |
| `ui.store.ts` | Any global UI toggles (mobile nav, modals) |

> **Rule:** if it comes from the DB or an API, it's TanStack Query. If it never touches the server, it's Zustand.

---

## Logging — Pino

Pino is used for all server-side structured logging. It outputs JSON in production (easy to ship to Datadog, Logtail, or any log aggregator) and pretty-prints in development.

### Setup

```ts
// lib/logger.ts
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  ...(process.env.NODE_ENV === 'development' && {
    transport: { target: 'pino-pretty', options: { colorize: true } },
  }),
})

export default logger
```

### Log Levels

| Level | When to use |
|---|---|
| `logger.info` | Normal operations: request received, data fetched |
| `logger.warn` | Unexpected but recoverable: empty result, slow query |
| `logger.error` | Failures: DB error, external API down |
| `logger.debug` | Verbose detail for local debugging only |

> Pino is **never used in client components** — it's server-only.

---

## Future Epics

### Epic 3 — Payments via Dodo
- Full purchase flow: `POST /api/checkout` → Dodo hosted page → webhook → order unlock
- Test packets: low-cost sample purchases for trust-building
- Subscriptions: recurring access plan via Dodo subscription API

### Epic 5 — Admin Panel
- Dataset CRUD: create (built), edit/delete (planned). **No publish/unpublish** — datasets are live on create (`is_published` removed)
- Binary/sample upload via the **two-step signed-URL flow** (`POST /api/v1/datasets/upload-url` → direct-to-Storage → `POST /api/v1/datasets`), not a through-the-server `POST /api/upload`
- Stats overview: total datasets, orders, revenue (planned)

### Epic 6 — Post Purchase
- `/account/orders` — full purchase history
- `/account/downloads` — every downloaded dataset with re-download button
- `GET /api/download/[id]` — signed URL generation after order verification

### Epic 7 — Messaging Chatbot
- Predefined Q&A for common questions (pricing, formats, refunds)
- Escalation path: unresolved queries → contact form or email

### Epic 8 — Coupons
- Coupon codes: buyer enters at checkout, validated against `coupons` table
- Admin panel: create/expire coupon codes, set discount type (% or flat)

### Epic 9 — Add to Cart
- Cart as Zustand store (client-side) + optional DB persistence
- Multi-dataset checkout: single Dodo session with line items
- Cart drawer in navbar
