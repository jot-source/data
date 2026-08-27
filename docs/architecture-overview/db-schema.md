# Database Schema — Dataset Marketplace

> Last updated: 30 July 2026
> Source of truth: `prisma/schema/schema.prisma` (+ `prisma/migrations/`). This doc mirrors it in prose.

---

## ⚠️ Authorization: Current State vs. Future Work (RLS)

> **Row-Level Security (RLS) is NOT yet implemented as role-based policies.**
> Development so far has focused on the **`user`** role and the core buyer flow.
> Read this before trusting any "Planned RLS Policy" line below.

**How access is actually enforced today (app layer, not the DB):**

- Every protected route/action calls `getSessionUser(cookieStore)` (see [../auth.md](../auth.md)), which verifies the Supabase JWT and reads the app `role` from the `users` row.
- Route handlers do the role check in code — e.g. `POST /api/v1/datasets` returns **403** unless `role ∈ {seller, admin}`; `GET …/download` returns **403** without a `paid` Order.
- The **service-role key** (server/seed only) bypasses any DB policy and is never shipped to the browser.

**What "Planned RLS Policy" means in this doc:** each table below lists the
**intended** Postgres RLS policy for when role-based RLS is implemented. Treat
these as the design target, **not** the current behaviour.

### 🔭 Future work — implement role-based RLS

When RLS is turned on (a future epic), the plan is:

1. `ALTER TABLE … ENABLE ROW LEVEL SECURITY;` on every table.
2. Add policies keyed on `auth.uid()` and the caller's app role. Because the JWT's
   built-in `role` claim is always the Postgres role `authenticated` (not our
   `user`/`seller`/`admin`), role-aware policies need the app role exposed to
   Postgres — either via a **custom access-token hook** that stamps the app role
   into the JWT, or a `SECURITY DEFINER` helper like `public.current_app_role()`
   that reads `public.users.role`.
3. Keep all writes that must bypass a user (webhook order updates, download audit
   rows) on the **service-role** client, which ignores RLS.
4. The per-table policies drafted below become the initial policy set.

> Until then, **do not** assume the database rejects a cross-user read/write —
> the app layer is the only thing enforcing it. Any new endpoint must do its own
> `getSessionUser` + role/ownership check.

---

## Tables Overview

### ✅ In the Prisma schema today

| Table | Model | Purpose |
|---|---|---|
| `users` | `User` | Auth users — role: `user`, `seller`, or `admin` |
| `datasets` | `Dataset` | Dataset metadata + facets; `uploaded_by_user_id` links to the owner |
| `orders` | `Order` | Purchases — **active** (Dodo checkout + webhook) |
| `downloads` | `Download` | Download audit rows — **active** (written at gated download time) |
| `saved_datasets` | `SavedDataset` | Wishlist / bookmarks (user ⇄ dataset, unique pair) |

### 🔧 Planned — NOT in the schema yet (no model, no migration)

| Table | Purpose |
|---|---|
| `meet_slots` | Availability windows posted by sellers/admin |
| `meet_bookings` | Confirmed bookings on a slot (Calendly-style) |
| `issues` | Support issues raised by users/sellers, resolved by admin |
| `contacts` | Contact-form submissions |
| `dataset_images` | Sort-ordered detail-page gallery |

> The planned tables are documented at the bottom as **design drafts** so the
> intended shape isn't lost — but they do not exist in `schema.prisma` and cannot
> be queried. Anyone building those features starts by adding the model +
> migration.

---

## users

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | Mirrors `auth.users.id` |
| `email` | `text` unique | |
| `full_name` | `text` nullable | Defaults to the email prefix when the user skips profile setup |
| `role` | `text` | Permission role: `'user' \| 'seller' \| 'admin'`, default `'user'` |
| `organization` | `text` nullable | Profile setup — company / university (optional/skippable) |
| `industry` | `text` nullable | Profile setup — the user's industry |
| `job_title` | `text` nullable | Profile setup — self-described role e.g. "Project Manager". **NOT** the permission `role` |
| `created_at` | `timestamptz` | DB default `now()` |
| `updated_at` | `timestamptz` | DB default `now()` (see note) + Prisma `@updatedAt` on app updates |

> `avatar_url` and `bio` are **not** in the schema (were "planned" — still not added).

**Relations:** `datasets[]` (owned/uploaded), `orders[]`, `downloads[]`, `savedDatasets[]`.

**Planned RLS Policy:** users can read/update their own row only; admin can read all.

> **`handle_new_user` trigger + `updated_at` default:** a Supabase trigger on
> `auth.users` INSERTs the matching `public.users` row on signup. Because that
> INSERT happens **outside Prisma**, every column it omits must have a DB-level
> default — so `updated_at` carries `@default(now())` (migration
> `..._user_updated_at_default`). Without it the trigger throws a NOT NULL
> violation and the whole signup transaction aborts (GoTrue returns a 500 with an
> empty body). **The trigger itself lives only in Supabase — it is not captured in
> a Prisma migration.**

**Role capabilities (target design):**

| Role | Can do |
|---|---|
| `user` | Browse, purchase, download datasets *(the flow built so far)* |
| `seller` | All user capabilities + list/manage their own datasets *(create/upload built; per-owner management UI partial)* |
| `admin` | Full access — all data, all users, analytics *(largely future)* |

---

## datasets

The listing table. Note the real owner column is **`uploaded_by_user_id`** (not `seller_id`).

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `title` | `text` | |
| `slug` | `text` unique | Used in URLs |
| `description` | `text` | |
| `industry` | `text` nullable | Indexed — filter |
| `category` | `text` nullable | Indexed — filter |
| `language` | `text` nullable | Indexed — filter |
| `modality` | `text` nullable | Indexed — Image / Text / Audio / Video / Multimodal … |
| `use_case` | `text` nullable | Indexed — Object Detection / Sentiment / … |
| `license_type` | `text` nullable | Indexed — Commercial / Research / CC-BY … |
| `quality_score` | `float` nullable | Indexed — 0–10, drives "9.2 quality" + min-quality filter |
| `annotation_type` | `text` nullable | Bounding Box / Segmentation / None … |
| `collection_method` | `text` nullable | Real-world / Synthetic / Crowdsourced … |
| `dataset_code` | `text` nullable | Human ref shown on card, e.g. "DS-1032" |
| `record_count` | `bigint` nullable | e.g. 1_800_000 → "1.8M scans" |
| `record_unit` | `text` nullable | Unit label for `record_count`, e.g. "scans" |
| `languages` | `text[]` | GIN indexed — multi-language coverage |
| `countries` | `text[]` | Country codes for the flag row |
| `compliance` | `text[]` | GIN indexed — e.g. `["IRB-compliant", "GDPR"]` |
| `tags` | `text[]` | GIN indexed — filter (`hasSome`) |
| `price` | `numeric(10,2)` | default `0` |
| `currency` | `text` | default `'USD'` |
| `thumbnail_url` | `text` nullable | Public CDN URL (browse-card image) |
| `binary_url` | `text` nullable | Private bucket **path** (signed at download time) |
| `sample_url` | `text` nullable | Public CDN URL (free sample) |
| `file_format` | `text` nullable | `.csv \| .json \| .parquet …` |
| `file_size_bytes` | `bigint` nullable | |
| `row_count` | `integer` nullable | |
| `dodo_product_id` | `text` nullable | Dodo Payments product ID — set on upload / backfill |
| `uploaded_by_user_id` | `uuid` FK nullable | → `users.id`; `onDelete: SetNull` (owner). Indexed |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | `@updatedAt` |

**Indexes:** B-tree on `industry`, `category`, `language`, `modality`, `use_case`, `license_type`, `quality_score`, `uploaded_by_user_id`; GIN on `tags`, `languages`, `compliance`.

> **No `is_published` column** — it was removed (migration `..._remove_dataset_is_published`). A dataset is **live the moment it's created**; there is no draft/publish step. Any older doc mentioning `isPublished`/`published` is stale.

**Relations:** `uploadedBy` (User?), `orders[]`, `downloads[]`, `savedByUsers[]`.

**Planned RLS Policy:** anyone can SELECT all rows (datasets are public on upload); `uploaded_by_user_id = auth.uid()` can INSERT/UPDATE their own; admin can INSERT/UPDATE/DELETE all. *(Today: SELECT is open via the public API; writes are gated in the route by `getSessionUser` role check, not by RLS.)*

> **Gallery images:** `image_urls` and a separate `dataset_images` table are both **deferred** — only `thumbnail_url` (card) + `sample_url` are used. See "Deferred design drafts" below.

---

## orders — **active** (Dodo checkout + webhook)

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK | → `users.id` (buyer); `onDelete: Cascade`; indexed |
| `dataset_id` | `uuid` FK | → `datasets.id`; `onDelete: Cascade`; indexed |
| `amount` | `numeric(10,2)` | Snapshotted from the dataset at checkout (price never trusted from client) |
| `currency` | `text` | default `'USD'` |
| `status` | `text` | `'pending' \| 'paid' \| 'failed' \| 'refunded'` default `'pending'`; indexed |
| `dodo_session_id` | `text` nullable | Dodo checkout session ref (set right after session create) |
| `dodo_payment_id` | `text` nullable | Dodo final payment ID (set by webhook) |
| `created_at` | `timestamptz` | |
| `paid_at` | `timestamptz` nullable | Set by the webhook on `payment.succeeded` |

**Relations:** `user`, `dataset`, `downloads[]`.

**Planned RLS Policy:** `auth.uid() = user_id` for SELECT/INSERT; only the service role (webhook) may UPDATE status. *(Today: checkout route sets `pending`; the webhook — using the service role — flips it via `updateMany({ where: { id, status: 'pending' }})`, which makes duplicate webhook deliveries idempotent no-ops.)*

### Order Status Lifecycle
```
pending  →  paid      (webhook: payment.succeeded)
pending  →  failed    (webhook: payment.failed)
paid     →  refunded  (webhook: payment.refunded — FUTURE, not wired up)
```

---

## downloads — **active** (written at gated download time)

An audit row stamped when a buyer actually pulls the binary.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK | → `users.id`; `onDelete: Cascade`; indexed |
| `dataset_id` | `uuid` FK | → `datasets.id`; `onDelete: Cascade`; indexed |
| `order_id` | `uuid` FK | → `orders.id`; `onDelete: Cascade`; indexed |
| `downloaded_at` | `timestamptz` | default `now()` |
| `ip_address` | `text` nullable | Buyer's IP (first hop of `x-forwarded-for`) at download time |

> Written by `GET /api/v1/datasets/[id]/download` **at download time** (not by the webhook) — so `ip_address`/`downloaded_at` reflect the buyer, not Dodo's servers. An audit-write failure never blocks the download.

**Planned RLS Policy:** `auth.uid() = user_id` for SELECT; INSERT only via service role.

---

## saved_datasets (Wishlist / Bookmarks)

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK | → `users.id`; `onDelete: Cascade`; indexed |
| `dataset_id` | `uuid` FK | → `datasets.id`; `onDelete: Cascade`; indexed |
| `created_at` | `timestamptz` | default `now()` |

**Constraint:** `@@unique([user_id, dataset_id])` — a user can save a dataset at most once. Added in migration `..._add_saved_datasets`.

**Planned RLS Policy:** `auth.uid() = user_id` for SELECT/INSERT/DELETE (each user manages only their own saves).

---

## Profile Dashboard — Data by Role (target design)

What each profile page is intended to surface. Marked with which parts are backed by real tables today.

| Data | User | Seller | Admin | Backing table exists? |
|---|---|---|---|---|
| Profile info | ✅ own row | ✅ own row | ✅ own row | ✅ `users` |
| Order history | ✅ own | — | ✅ all | ✅ `orders` |
| Downloaded datasets | ✅ own | — | — | ✅ `downloads` |
| Saved / wishlist | ✅ own | — | — | ✅ `saved_datasets` |
| Listed datasets | — | ✅ own | ✅ all | ✅ `datasets.uploaded_by_user_id` |
| Dataset revenue | — | ✅ own | ✅ total | ✅ derive from `orders` |
| Issues filed/assigned | ✅/– | ✅/✅ | –/✅ | ❌ `issues` planned |
| Meet bookings / slots | ✅ | ✅ | ✅ | ❌ `meet_*` planned |
| Analytics | — | Basic | Full | ❌ derive/aggregate (future) |

---

## Deferred design drafts (NOT in the schema)

> Kept so the intended shape isn't lost. None of these exist as a model/migration — implementing any of them starts with adding the Prisma model.

### issues _(planned)_
Support issues raised by users/sellers, triaged by admin/seller. Draft columns: `id`, `reporter_id`, `assigned_to_id?`, `order_id?`, `dataset_id?`, `title`, `description`, `category` (`order|dataset|billing|account|general`), `priority` (`low|medium|high`), `status` (`open|in_progress|resolved|closed`), `resolution_notes?`, `created_at`, `updated_at`, `resolved_at?`. Lifecycle: `open → in_progress → resolved → closed`.

### meet_slots / meet_bookings _(planned)_
Calendly-style scheduling. `meet_slots`: `id`, `host_id`, `title`, `description?`, `duration_minutes`, `available_date`, `start_time`, `end_time`, `is_booked`, `meet_link?`, `created_at`. `meet_bookings`: `id`, `slot_id`, `booker_id`, `topic`, `notes?`, `status` (`pending|confirmed|cancelled`), `created_at`.

### dataset_images _(deferred)_
Detail-page gallery. Either a flat `image_urls text[]` on `datasets` (removed 2026-06-23 — nothing read it) **or** a sort-ordered table: `id`, `dataset_id`, `image_url`, `sort_order`. Re-add whichever fits when the detail-page gallery is actually built.

### contacts _(deferred)_
Contact-form submissions: `id`, `name`, `email`, `message`, `created_at`. (A `POST /api/v1/contact` route exists but does not persist to this table.)
