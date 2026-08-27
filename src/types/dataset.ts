// ─── Dataset Types ────────────────────────────────────────────

import type { Dataset } from '@prisma/client'

/**
 * A full dataset row as it reaches CLIENT components on the detail page: the
 * Prisma `Dataset` after the server component serializes it to plain JSON
 * (BigInt → number, Decimal → string, Date → ISO string — see the
 * `JSON.parse(JSON.stringify(...))` in `datasets/[id]/page.tsx`).
 *
 * Derived from the Prisma model via `Omit` so it can't drift from the schema —
 * only the fields serialization actually changes are overridden.
 */
export type DatasetDetail = Omit<
  Dataset,
  'recordCount' | 'fileSizeBytes' | 'price' | 'createdAt' | 'updatedAt'
> & {
  recordCount: number | null
  fileSizeBytes: number | null
  price: number | string
  createdAt: string
  updatedAt: string
}

/**
 * Lightweight shape returned by GET /api/v1/datasets — everything the explore
 * page card renders and nothing heavier. Note the service normalizes a few DB
 * types so this stays JSON-safe (and cacheable):
 *   - `recordCount` comes off Postgres as BigInt → mapped to number here
 *   - `sampleAvailable` is derived from whether a sampleUrl exists
 * Price/Decimal is intentionally absent — the card doesn't show a price.
 */
export interface DatasetCard {
  id: string
  title: string
  slug: string
  description: string

  datasetCode: string | null
  industry: string | null
  category: string | null

  qualityScore: number | null
  fileFormat: string | null

  recordCount: number | null
  recordUnit: string | null

  languages: string[]
  countries: string[]
  compliance: string[]

  sampleAvailable: boolean
  thumbnailUrl: string | null
  updatedAt: string
}

// Query params + their validation now live in `@/validations/dataset.schema`
// (Zod is the single source of truth so the type can never drift from the
// runtime checks enforced on GET /api/v1/datasets).

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Shape of the GET /api/v1/datasets JSON response body.
 */
export interface DatasetsListResponse {
  datasets: DatasetCard[]
  pagination: PaginationMeta
}

// ─── Facets ───────────────────────────────────────────────────

/** One selectable filter option + how many datasets carry it. */
export interface FacetCount {
  value: string
  count: number
}

/** Sidebar facet buckets returned by GET /api/v1/datasets/facets. */
export interface DatasetFacets {
  industry: FacetCount[]
  modality: FacetCount[]
  useCase: FacetCount[]
  licenseType: FacetCount[]
}
