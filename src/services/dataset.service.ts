import { Prisma } from '@prisma/client'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import type { DatasetCard, DatasetFacets, FacetCount } from '@/types/dataset'
import type { DatasetsQueryParams, DatasetSort } from '@/validations/dataset.schema'

// Bust this tag (revalidateTag) whenever a dataset is published or edited so the
// cached browse/list results below pick the change up immediately.
export const DATASETS_CACHE_TAG = 'datasets'

export interface PaginatedDatasets {
  datasets: DatasetCard[]
  total: number
}

// Card projection selected from Postgres. `recordCount` arrives as BigInt and
// `sampleUrl` as a nullable string — both are normalized in `toCard` below so
// the returned shape stays JSON-serializable (required for unstable_cache).
const CARD_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  datasetCode: true,
  industry: true,
  category: true,
  qualityScore: true,
  fileFormat: true,
  recordCount: true,
  recordUnit: true,
  languages: true,
  countries: true,
  compliance: true,
  sampleUrl: true,
  thumbnailUrl: true,
  updatedAt: true,
} satisfies Prisma.DatasetSelect

type CardRow = Prisma.DatasetGetPayload<{ select: typeof CARD_SELECT }>

function toCard(row: CardRow): DatasetCard {
  const { sampleUrl, recordCount, updatedAt, ...rest } = row
  return {
    ...rest,
    // BigInt → number: card counts are display-only and safely within 2^53.
    recordCount: recordCount !== null ? Number(recordCount) : null,
    sampleAvailable: sampleUrl !== null,
    updatedAt: updatedAt.toISOString(),
  }
}

// Maps the API `sort` param to a Prisma orderBy. `nulls: 'last'` keeps datasets
// without a quality score from floating to the top of the "quality" sort.
const ORDER_BY: Record<DatasetSort, Prisma.DatasetOrderByWithRelationInput> = {
  recent: { createdAt: 'desc' },
  quality: { qualityScore: { sort: 'desc', nulls: 'last' } },
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
}

/**
 * Fetch published datasets — lightweight card projection, filtered + paginated.
 * Filters map 1:1 to indexed/filterable columns on `datasets`
 * (industry, category, language, tags, currency, fileFormat, price range).
 *
 * Fields returned per dataset: id, title, slug, description, category, language, thumbnailUrl
 */
/**
 * Fetch a single dataset by id — full row, used server-side only
 * (checkout route's price/product lookup, dataset detail page).
 */
export async function getDatasetById(id: string) {
  return prisma.dataset.findUnique({ where: { id } })
}

/**
 * Fetch a single dataset by slug — full row, used server-side only
 * (dataset detail page).
 */
export async function getDatasetBySlug(slug: string) {
  return prisma.dataset.findUnique({ where: { slug } })
}

/**
 * Fetch related datasets (similar category/industry, excluding current)
 */
export async function getRelatedDatasets(dataset: { id: string, category?: string | null, industry?: string | null }, limit: number = 4) {
  const where: Prisma.DatasetWhereInput = {
    id: { not: dataset.id },
    ...(dataset.category || dataset.industry ? {
      OR: [
        ...(dataset.category ? [{ category: dataset.category }] : []),
        ...(dataset.industry ? [{ industry: dataset.industry }] : []),
      ]
    } : {})
  }

  const rows = await prisma.dataset.findMany({
    where,
    select: CARD_SELECT,
    orderBy: { qualityScore: 'desc' },
    take: limit,
  })
  
  return rows.map(toCard)
}

// `in` (not equals) — a multi-select facet matches a dataset whose value is any
// of the checked options. Empty arrays are treated as "no filter".
const inList = (values?: string[]) =>
  values && values.length > 0 ? { in: values } : undefined

/**
 * Builds the shared Prisma `where` from the validated query params. Used by both
 * the list query and the facet counts so they always agree on what "matches".
 */
function buildDatasetWhere(params: DatasetsQueryParams): Prisma.DatasetWhereInput {
  const {
    q,
    industry,
    modality,
    useCase,
    licenseType,
    annotationType,
    collectionMethod,
    compliance,
    minQuality,
    category,
    language,
    currency,
    fileFormat,
    tags,
    minPrice,
    maxPrice,
  } = params

  return {
    ...(q && {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    }),
    ...(inList(industry) && { industry: inList(industry) }),
    ...(inList(modality) && { modality: inList(modality) }),
    ...(inList(useCase) && { useCase: inList(useCase) }),
    ...(inList(licenseType) && { licenseType: inList(licenseType) }),
    ...(inList(annotationType) && { annotationType: inList(annotationType) }),
    ...(inList(collectionMethod) && { collectionMethod: inList(collectionMethod) }),
    // Array column — matches datasets carrying ANY of the requested certs.
    ...(compliance && compliance.length > 0 && { compliance: { hasSome: compliance } }),
    ...(minQuality !== undefined && { qualityScore: { gte: minQuality } }),
    ...(category && { category }),
    ...(language && { language }),
    ...(currency && { currency }),
    ...(fileFormat && { fileFormat }),
    // hasSome (not hasEvery) — a dataset matches if it carries ANY of the requested tags
    ...(tags && tags.length > 0 && { tags: { hasSome: tags } }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
  }
}

export async function getPublishedDatasets(
  params: DatasetsQueryParams
): Promise<PaginatedDatasets> {
  const { page, limit, sort } = params
  const where = buildDatasetWhere(params)

  logger.info(
    { where, page, limit, sort },
    'dataset.service: fetching published datasets'
  )

  try {
    // Two independent read-only queries run concurrently. We deliberately do NOT
    // wrap them in prisma.$transaction(): on Supabase's transaction-mode pooler a
    // transaction pins a server connection for its whole BEGIN..COMMIT, which under
    // connection pressure gets queued by PgBouncer and trips the 5s transaction
    // timeout (P2028). The tiny consistency window between the two queries is
    // irrelevant for a paginated listing.
    const [rows, total] = await Promise.all([
      prisma.dataset.findMany({
        where,
        select: CARD_SELECT,
        orderBy: ORDER_BY[sort],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dataset.count({ where }),
    ])

    logger.info(
      { count: rows.length, total, page, limit },
      'dataset.service: published datasets fetched successfully'
    )

    return { datasets: rows.map(toCard), total }
  } catch (error) {
    logger.error(
      { error, where, page, limit },
      'dataset.service: failed to fetch published datasets'
    )
    throw error
  }
}

// ─── Facets ───────────────────────────────────────────────────

// One { value, count } bucket per distinct non-null value, most common first.
// These are global counts (not narrowed by the active filters) — the sidebar
// uses them as a "how much is available" hint. Explicit per-field groupBy calls
// (rather than a dynamic field) keep Prisma's return types inferable.
const toFacet = (rows: { value: string | null; _count: { _all: number } }[]): FacetCount[] =>
  rows
    .filter((r): r is { value: string; _count: { _all: number } } => Boolean(r.value))
    .map((r) => ({ value: r.value, count: r._count._all }))

/**
 * Distinct values + counts for each sidebar facet, powering the checkbox lists
 * and their trailing counts (e.g. "Healthcare 32").
 */
export async function getDatasetFacets(): Promise<DatasetFacets> {
  const [industry, modality, useCase, licenseType] = await Promise.all([
    prisma.dataset.groupBy({
      by: ['industry'],
      where: { industry: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { industry: 'desc' } },
    }),
    prisma.dataset.groupBy({
      by: ['modality'],
      where: { modality: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { modality: 'desc' } },
    }),
    prisma.dataset.groupBy({
      by: ['useCase'],
      where: { useCase: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { useCase: 'desc' } },
    }),
    prisma.dataset.groupBy({
      by: ['licenseType'],
      where: { licenseType: { not: null } },
      
      _count: { _all: true },
      orderBy: { _count: { licenseType: 'desc' } },
    }),
  ])

  return {
    industry: toFacet(industry.map((g) => ({ value: g.industry, _count: g._count }))),
    modality: toFacet(modality.map((g) => ({ value: g.modality, _count: g._count }))),
    useCase: toFacet(useCase.map((g) => ({ value: g.useCase, _count: g._count }))),
    licenseType: toFacet(
      licenseType.map((g) => ({ value: g.licenseType, _count: g._count }))
    ),
  }
}

export const getCachedDatasetFacets = unstable_cache(
  () => getDatasetFacets(),
  ['dataset-facets'],
  { revalidate: 60, tags: [DATASETS_CACHE_TAG] }
)

/**
 * Cache-wrapped {@link getPublishedDatasets} for the public browse/list paths.
 * The published catalogue is read on nearly every visit but changes rarely, so
 * we serve it from Next's data cache and hit Postgres at most once per
 * `revalidate` window per unique filter+page combination — cutting repeated
 * identical queries under load. Bust it with `revalidateTag(DATASETS_CACHE_TAG)`.
 *
 * Safe to cache because `DatasetCard` is plain JSON. Do NOT cache
 * {@link getDatasetById} this way — it returns `price` (Decimal) and
 * `fileSizeBytes` (BigInt), which Next's cache cannot serialize.
 */
export const getCachedPublishedDatasets = unstable_cache(
  (params: DatasetsQueryParams) => getPublishedDatasets(params),
  ['published-datasets'],
  { revalidate: 60, tags: [DATASETS_CACHE_TAG] }
)
