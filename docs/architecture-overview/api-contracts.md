# API Contracts — Dataset Marketplace

> Last updated: 30 July 2026
> ✅ = route exists in `src/app/api/**` today · 🔧 = planned, not built yet.

**Response shapes are not fully standardised yet.** Newer routes (checkout,
download, upload-url, POST datasets) use a `{ success, data }` / `{ success, error }`
envelope; the older list routes return bare `{ datasets, pagination }` or
`{ facets }` and `{ error }`. A single `ApiResponse<T>` wrapper is the *intended*
convention:

```ts
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }
```

> Auth model: protected routes call `getSessionUser(cookieStore)` and do the role
> check **in code** (see [../auth.md](../auth.md)). RLS is not enforcing this at the
> DB yet — see [db-schema.md → Authorization](db-schema.md).

---

## All Endpoints

### ✅ Dataset endpoints (built)

| Endpoint | Access | Purpose |
|---|---|---|
| `GET /api/v1/datasets` | Public | Paginated + filtered dataset list |
| `GET /api/v1/datasets/facets` | Public | Distinct values + counts for sidebar facets (industry, modality, useCase, licenseType) |
| `POST /api/v1/datasets/upload-url` | Seller / Admin | Mint a signed URL to upload a dataset file directly to Storage |
| `POST /api/v1/datasets` | Seller / Admin | Create dataset listing (JSON metadata + storage paths) |
| `GET /api/v1/datasets/[id]/sample` | Auth | Redirect to the public sample file (login-gated preview) |
| `GET /api/v1/datasets/[id]/download` | Auth + paid Order | Sign a 60s URL for the private binary + write a `Download` audit row |
| `POST /api/v1/contact` | Public | Contact / data-requirement form → sends email via Resend |

> **File uploads do NOT go through the API.** Large binaries (up to multi-GB) would blow past the Vercel serverless request-body limit. The client uploads **directly** to Supabase Storage via a short-lived signed URL from `POST /api/v1/datasets/upload-url`, then sends only the storage paths to `POST /api/v1/datasets`.

> **Contact-form handover TODO:** `POST /api/v1/contact` emails via Resend and does **not** persist to any table. Two values are hardcoded in the route and must be changed for production: the `to:` recipient (`your-email@example.com`) and the `from:` sender (`onboarding@resend.dev` → your verified domain). Without `RESEND_API_KEY` it returns `{ success: true, simulated: true }` and sends nothing.

### ✅ Payment & download endpoints (built) — see [../dodopayments.md](../dodopayments.md)

| Endpoint | Access | Purpose |
|---|---|---|
| `POST /api/v1/checkout` | Auth | Create a `pending` Order + Dodo-hosted checkout session; returns `checkoutUrl` |
| `POST /api/v1/webhooks/dodo` | Dodo (signed) | Verify signature, flip Order → `paid`/`failed`, sync `product.updated` |
| `GET /api/v1/datasets/[id]/download` | Auth + paid Order | (listed above) the actual purchase-gated download |

> The old planned paths `POST /api/payments/create-session`, `POST /api/webhooks/dodo`, and `GET /api/download/[id]` were **superseded** by the `…/v1/…` routes above. The detailed "Future" sections lower in this doc are kept for historical context but the **built** contract is the one here + in dodopayments.md.

### 🔧 Planned endpoints (NOT built yet)

None of the following have a route in `src/app/api/**` yet. Shapes below the fold are **design drafts**.

| Endpoint | Access | Purpose |
|---|---|---|
| `PUT /api/v1/datasets/[id]` | Owner Seller / Admin | Update a dataset |
| `DELETE /api/v1/datasets/[id]` | Owner Seller / Admin | Delete a dataset |
| `GET /api/v1/profile/me` · `PATCH …` | Auth | Profile + role data *(today profile reads go through Server Components, not an API route)* |
| `GET/POST/DELETE /api/v1/schedule/**` | mixed | Calendly-style meet slots + bookings *(no `meet_*` tables yet)* |
| `GET/POST/PATCH /api/v1/issues/**` | mixed | Support issues *(no `issues` table yet)* |
| `GET /api/v1/admin/analytics` | Admin | Platform-wide stats |

---

## GET /api/v1/datasets

Paginated, filtered listing of **published** datasets. Public — no auth. All params optional and validated by `datasetsQuerySchema`.

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | `number` | Page number, 1-indexed (default: 1) |
| `limit` | `number` | Page size, max 100 (default: 12) |
| `industry` | `string` | Exact-match filter |
| `category` | `string` | Exact-match filter |
| `language` | `string` | Exact-match filter |
| `currency` | `string` | 3-letter ISO, exact-match |
| `fileFormat` | `string` | Exact-match filter |
| `tags` | `string` | Comma-separated; matches datasets with ANY of the tags |
| `minPrice` | `number` | Inclusive lower bound |
| `maxPrice` | `number` | Inclusive upper bound (must be ≥ `minPrice`) |

**Example:** `/api/v1/datasets?industry=Finance&minPrice=0&maxPrice=500&tags=finance,nse&page=1&limit=12`

**Response (200):**
```json
{
  "datasets": [ { "id": "...", "title": "...", "slug": "...", "description": "...", "category": "...", "language": "...", "thumbnailUrl": "..." } ],
  "pagination": { "page": 1, "limit": 12, "total": 42, "totalPages": 4 }
}
```
Invalid params → `400 { error, details: [{ field, message }] }`.

---

## Creating a Dataset — Two-Step Direct Upload

Files never pass through the API. The client uploads each file straight to Supabase Storage, then creates the listing with the resulting paths.

### Step 1 — `POST /api/v1/datasets/upload-url`  *(seller / admin)*

**Request (JSON):**
```json
{ "title": "NSE Intraday Ticks 2024", "kind": "binary", "fileName": "ticks.csv" }
```
`kind` is `"binary"` (private bucket) or `"sample"` (public bucket). The object key is derived server-side from `title`.

**Response (200):**
```json
{ "success": true, "data": { "bucket": "dataset-binaries", "path": "datasets/nse-intraday-ticks-2024.csv", "token": "…", "signedUrl": "https://…" } }
```

**Then the client uploads directly** (browser, not the API):
```ts
await supabase.storage.from(bucket).uploadToSignedUrl(path, token, file)
```

### Step 2 — `POST /api/v1/datasets`  *(seller / admin)*

Creates the listing and **publishes it immediately** — a Dodo product is auto-created, and the dataset is live for purchase. Send metadata as JSON plus the storage paths from step 1.

**Request (JSON):**
```json
{
  "title": "NSE Intraday Ticks 2024",
  "description": "One-minute OHLCV ticks for NSE equities",
  "industry": "Finance",
  "category": "Time-Series",
  "language": "English",
  "price": 149.99,
  "currency": "USD",
  "fileFormat": ".csv",
  "rowCount": 1250000,
  "tags": ["finance", "time-series", "nse"],
  "binaryPath": "datasets/nse-intraday-ticks-2024.csv",
  "samplePath": "samples/nse-intraday-ticks-2024.csv"
}
```
Required: `title`, `description`, `industry`, `category`, `price`. `binaryPath` / `samplePath` are optional but, if given, must match the title-derived key **and** already exist in storage.

**Responses:** `201` created · `400` validation / path mismatch / file-not-in-storage · `401` no session · `403` not seller/admin · `409` duplicate title (slug).

---

> 🔧 **The sections below (`/api/profile/me`, `/api/schedule/**`, `/api/issues/**`, `/api/admin/analytics`) are design drafts — those routes are NOT built yet.** Profile data today is read in Server Components via `getSessionUser` + Prisma, not through an API route. Kept here as the intended contract for whoever builds them.

## GET /api/profile/me 🔧 _(planned)_

Returns current user's profile and role-specific data in a single call.

**Response (role = user):**
```json
{
  "success": true,
  "data": {
    "profile": { "id": "...", "fullName": "...", "email": "...", "role": "user", "avatarUrl": "..." },
    "orders": [ { "id": "...", "datasetTitle": "...", "status": "paid", "amount": 49.00, "paidAt": "..." } ],
    "downloads": [ { "datasetId": "...", "datasetTitle": "...", "downloadedAt": "..." } ],
    "issues": [ { "id": "...", "title": "...", "status": "open", "priority": "medium" } ],
    "upcomingMeets": [ { "slotId": "...", "hostName": "...", "date": "...", "time": "...", "topic": "..." } ]
  }
}
```

**Response (role = seller):**
```json
{
  "success": true,
  "data": {
    "profile": { "id": "...", "fullName": "...", "role": "seller", "bio": "..." },
    "datasets": [ { "id": "...", "title": "...", "orderCount": 12, "revenue": 588.00 } ],
    "issues": [ { "id": "...", "title": "...", "status": "in_progress", "assignedToMe": true } ],
    "meetSlots": [ { "id": "...", "date": "...", "startTime": "...", "isBooked": false } ],
    "upcomingBookings": [ { "bookingId": "...", "bookerName": "...", "topic": "...", "date": "..." } ]
  }
}
```

**Response (role = admin):**
```json
{
  "success": true,
  "data": {
    "profile": { "id": "...", "fullName": "...", "role": "admin" },
    "analytics": { "totalRevenue": 12400.00, "totalOrders": 248, "totalDatasets": 64, "totalUsers": 310 },
    "openIssues": [ { "id": "...", "title": "...", "priority": "high", "reporterName": "..." } ],
    "upcomingBookings": [ { "bookingId": "...", "bookerName": "...", "topic": "...", "date": "..." } ]
  }
}
```

---

## GET /api/schedule/[hostId]/slots

Returns all available (non-booked) slots for a host. Used to render the calendar UI.

**Query params:**

| Param | Type | Description |
|---|---|---|
| `month` | `string` | `YYYY-MM` — returns slots for that month |

**Response:**
```json
{
  "success": true,
  "data": {
    "host": { "id": "...", "fullName": "...", "avatarUrl": "...", "bio": "..." },
    "slots": [
      {
        "id": "...",
        "date": "2026-07-10",
        "startTime": "10:00",
        "endTime": "10:30",
        "durationMinutes": 30,
        "title": "Dataset Q&A"
      }
    ]
  }
}
```

---

## POST /api/schedule/[hostId]/book

Books an available slot. Marks the slot as `is_booked = true`.

**Request:**
```json
{
  "slotId": "uuid-of-slot",
  "topic": "Questions about Finance Dataset",
  "notes": "I want to understand the data freshness and update frequency"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "...",
    "status": "pending",
    "slotDate": "2026-07-10",
    "slotTime": "10:00",
    "meetLink": "https://meet.google.com/abc-defg-hij",
    "hostName": "Jane (Seller)"
  }
}
```

---

## POST /api/issues

Opens a new support issue. Any authenticated user can open one.

**Request:**
```json
{
  "title": "Download link expired immediately",
  "description": "I purchased the dataset but the download link says it has expired.",
  "category": "order",
  "priority": "high",
  "orderId": "uuid-of-order",
  "datasetId": "uuid-of-dataset"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "issueId": "...",
    "status": "open",
    "createdAt": "2026-06-19T10:00:00Z"
  }
}
```

---

## GET /api/admin/analytics

Platform-wide aggregate stats. Admin only.

**Response:**
```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 12400.00,
      "thisMonth": 3200.00,
      "lastMonth": 2900.00
    },
    "orders": {
      "total": 248,
      "paid": 230,
      "pending": 10,
      "failed": 8
    },
    "datasets": {
      "total": 64,
      "published": 58,
      "draft": 6
    },
    "users": {
      "total": 310,
      "buyers": 280,
      "sellers": 25,
      "admins": 5
    },
    "issues": {
      "open": 4,
      "inProgress": 2,
      "resolved": 38
    }
  }
}
```

---

## POST /api/v1/checkout ✅ _(built — supersedes the old `/api/payments/create-session`)_

Starts a Dodo-hosted checkout for a single dataset. Auth required.

**Request:**
```json
{ "datasetId": "uuid-of-the-dataset" }
```

**Response (201):**
```json
{ "success": true, "data": { "checkoutUrl": "https://checkout.dodopayments.com/...", "orderId": "our-order-uuid" } }
```

**Server-side steps (see `src/app/api/v1/checkout/route.ts`):**
1. `getSessionUser` → **401** if no session.
2. Validate body with `createCheckoutSchema` → **400** on failure.
3. Look up the dataset from **our** DB (price/currency/`dodoProductId`) — the client-shown price is never trusted. **404** if missing; **400** if it has no `dodoProductId` (not purchasable yet).
4. `findPaidOrder` → **409** "You already own this dataset."
5. Create a `pending` Order (amount/currency snapshotted from the dataset).
6. `createCheckoutSession` with `metadata.orderId` so the webhook can find its way back; `return_url` = `/checkout/success?orderId=…`.
7. Save `dodoSessionId` on the Order, return `checkoutUrl`. **502** if Dodo returns no URL; **500** on other errors.

---

## POST /api/v1/webhooks/dodo ✅ _(built — supersedes the old `/api/webhooks/dodo`)_

Receives payment confirmation from Dodo. Signature verification + payload validation are handled by the `@dodopayments/nextjs` `Webhooks()` adapter (**401** bad signature, **400** malformed). Handlers: `payment.succeeded` → `markOrderPaid`, `payment.failed` → `markOrderFailed`, `product.updated` → `syncDatasetFromDodoProduct`. Requires `DODO_PAYMENTS_WEBHOOK_KEY` (route 500s at load if empty). Full detail in [../dodopayments.md](../dodopayments.md).

<details><summary>Historical draft payload (from the original Epic-3 plan)</summary>

**Webhook payload (fired by Dodo):**
```json
{
  "type": "payment.succeeded",
  "data": {
    "payment_id": "dodo_pay_xxxx",
    "session_id": "dodo_sess_xxxx",
    "amount": 4900,
    "currency": "USD",
    "status": "succeeded",
    "customer": { "email": "user@example.com" },
    "metadata": {
      "orderId": "our-internal-order-uuid",
      "userId": "supabase-user-uuid",
      "datasetId": "dataset-uuid"
    }
  },
  "created_at": "2026-06-17T12:00:00Z"
}
```

Historical draft steps (note: the real webhook does **not** create a Download row — that happens at download time):
1. Verify webhook signature using Dodo's signing secret
2. Find the `Order` by `orderId` from `metadata`
3. Update Order → `status: "paid"`, `dodoPaymentId`, `paidAt`
4. Return `200 OK` to Dodo (otherwise Dodo retries)

</details>

---

## GET /api/v1/datasets/[id]/download ✅ _(built — supersedes the old `/api/download/[id]`)_

Serves the paid dataset binary. Gated on **both** a valid session **and** a `paid` Order for this user+dataset.

**Flow (`src/app/api/v1/datasets/[id]/download/route.ts`):**
1. `getSessionUser` → **401** if no session.
2. Load dataset → **404** if missing, **404** if it has no `binaryUrl`.
3. `findPaidOrder(user.id, id)` → **403** "Purchase this dataset to download it." if none.
4. `createSignedDownloadUrl('binary', dataset.binaryUrl, 60)` — a **60-second** signed URL for the private `dataset-binaries` object (`binaryUrl` holds the storage *path*, not a URL).
5. Write a `Download` audit row with the buyer's real IP (first hop of `x-forwarded-for`). An audit-write failure is logged but **never blocks** the download.
6. **302 redirect** the browser to the signed URL.

**Companion:** `GET /api/v1/datasets/[id]/sample` — login-only (no paid Order needed); redirects to the public `sample_url`. Samples are free previews.

---

## Feature Breakdown by Epic

### Epic 0 — Landing Page ✅

| Section | Details |
|---|---|
| Hero | Headline, subheadline, CTA to `/datasets` |
| Featured Datasets | 3–6 curated datasets pulled server-side via `dataset.service.ts` |
| Category Highlights | Visual grid of industries/categories linking to filtered listing |
| Social Proof | Testimonials, dataset count stats |

### Epic 1 — User Onboarding ✅

| Feature | Details |
|---|---|
| Register | Supabase Auth email/password signup → insert into `users` table |
| Login | Supabase Auth → session cookie set → redirect via `?next=` param |
| Profile | `/profile` — order history, downloads, saved datasets |
| Route Guard | `proxy.ts` (the renamed middleware) checks the session on every request to `/account/*` and `/admin/*`, and redirects to `/login?next=…` if absent |

Auth flow:
```
User submits login form
  ↓
supabase.auth.signInWithPassword()
  ↓
Supabase sets session cookie
  ↓
proxy.ts reads cookie on every subsequent request (getClaims — local JWT check)
  ↓
Protected routes (/account/*, /admin/*): redirect to /login if no session
```
> See [../auth.md](../auth.md) for the full session lifecycle, the modal-based auth UI, and Google OAuth.

### Epic 2 — Search & Discovery ✅

| Feature | Details |
|---|---|
| Dataset Listing `/datasets` | Server-rendered page, initial data fetched via `dataset.service.ts` |
| Filters | Industry, category, language, file format, price range — state in URL search params |
| Filter Sidebar | Zustand controls open/close; pending selection committed on "Apply" |
| Client Refetch | TanStack Query `useDatasets(filters)` re-fetches when URL params change |
| Detail Page `/datasets/[slug]` | Full metadata, image gallery, sample download (public), Buy button (login required — Epic 3) |
| Sample Download | Public CDN URL, no auth, direct link |
