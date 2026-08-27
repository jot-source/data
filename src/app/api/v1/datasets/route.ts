import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { Prisma } from '@prisma/client'
import { getCachedPublishedDatasets } from '@/services/dataset.service'
import { getSessionUser } from '@/services/auth.service'
import { createDatasetProduct } from '@/services/payment.service'
import {
  isExpectedPath,
  getStoredObject,
  getSamplePublicUrl,
} from '@/services/storage.service'
import { datasetsQuerySchema, createDatasetSchema } from '@/validations/dataset.schema'
import { slugify } from '@/utils/slugify'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'


/**
 * GET /api/v1/datasets
 *
 * Returns a paginated list of published datasets with lightweight card data:
 *   id, title, slug, description, category, language, thumbnailUrl
 *
 * Query params (all optional, validated by `datasetsQuerySchema`):
 *   - page, limit          → pagination (1-indexed page, limit capped at 100)
 *   - industry, category,
 *     language, currency,
 *     fileFormat            → exact-match filters on the matching `datasets` column
 *   - tags                  → comma-separated list, matches datasets with ANY of the tags
 *   - minPrice, maxPrice    → inclusive price range filter
 *
 * Public route — no auth required.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // Only pull the keys the schema knows about — anything else in the query
  // string is ignored rather than silently trusted.
  const rawQuery = {
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    q: searchParams.get('q') ?? undefined,
    // Multi-select sidebar facets (comma-separated in the URL).
    industry: searchParams.get('industry') ?? undefined,
    modality: searchParams.get('modality') ?? undefined,
    useCase: searchParams.get('useCase') ?? undefined,
    licenseType: searchParams.get('licenseType') ?? undefined,
    annotationType: searchParams.get('annotationType') ?? undefined,
    collectionMethod: searchParams.get('collectionMethod') ?? undefined,
    compliance: searchParams.get('compliance') ?? undefined,
    minQuality: searchParams.get('minQuality') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    language: searchParams.get('language') ?? undefined,
    currency: searchParams.get('currency') ?? undefined,
    fileFormat: searchParams.get('fileFormat') ?? undefined,
    tags: searchParams.get('tags') ?? undefined,
    minPrice: searchParams.get('minPrice') ?? undefined,
    maxPrice: searchParams.get('maxPrice') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
  }

  const parsed = datasetsQuerySchema.safeParse(rawQuery)

  if (!parsed.success) {
    logger.warn(
      { rawQuery, issues: parsed.error.issues },
      'GET /api/v1/datasets — query param validation failed'
    )
    return NextResponse.json(
      {
        error: 'Invalid query parameters.',
        details: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 400 }
    )
  }

  const query = parsed.data

  logger.info({ query }, 'GET /api/v1/datasets — request received')

  try {
    const { datasets, total } = await getCachedPublishedDatasets(query)

    logger.info(
      { count: datasets.length, total, page: query.page, limit: query.limit },
      'GET /api/v1/datasets — responding with dataset list'
    )

    return NextResponse.json(
      {
        datasets,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error(
      { error },
      'GET /api/v1/datasets — unhandled error, returning 500'
    )

    return NextResponse.json(
      { error: 'Failed to fetch datasets. Please try again later.' },
      { status: 500 }
    )
  }
}






/**
 * POST /api/v1/datasets
 *
 * Step 2 of dataset creation. Creates a new (unpublished) listing from a JSON
 * body. The actual files are uploaded directly to Supabase Storage beforehand
 * via POST /api/v1/datasets/upload-url, so this endpoint receives only metadata
 * plus the storage paths those uploads produced — no file bytes pass through.
 *
 * Restricted to `seller` and `admin`. Auth uses getClaims() via the auth service.
 *
 * Body: { title, description, industry, category, price, ...,
 *         binaryPath?, samplePath? }
 */
export async function POST(request: NextRequest) {
  // ── 1. Auth — verify session + app role ───────────────────
  const cookieStore = await cookies()
  const user = await getSessionUser(cookieStore)

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  // Only sellers and admins may create a listing. The app role lives in the DB,
  // not the JWT, so getSessionUser resolves it for us.
  if (!['seller', 'admin'].includes(user.role)) {
    logger.warn({ userId: user.id, role: user.role }, 'POST /api/v1/datasets — forbidden create attempt')
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  // ── 2. Parse + validate JSON metadata ─────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Request body must be valid JSON.' },
      { status: 400 }
    )
  }

  const parsed = createDatasetSchema.safeParse(body)

  if (!parsed.success) {
    logger.warn(
      { userId: user.id, issues: parsed.error.issues },
      'POST /api/v1/datasets — body validation failed'
    )
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid dataset data.',
        details: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 400 }
    )
  }

  const data = parsed.data
  const slug = slugify(data.title)
  logger.info({ slug, userId: user.id }, 'POST /api/v1/datasets — create request received')

  // ── 3. Resolve storage references ─────────────────────────
  // Each provided path must (a) match the key we'd generate for this title and
  // (b) actually exist in storage — otherwise the listing would point at a file
  // the seller never uploaded (or someone else's object).
  let binaryUrl: string | null = null
  let sampleUrl: string | null = null
  let fileSizeBytes: bigint | null = null

  if (data.binaryPath) {
    if (!isExpectedPath('binary', data.title, data.binaryPath)) {
      logger.warn({ userId: user.id, path: data.binaryPath }, 'POST /api/v1/datasets — binaryPath mismatch')
      return NextResponse.json(
        { success: false, error: 'binaryPath does not match this dataset.' },
        { status: 400 }
      )
    }

    const obj = await getStoredObject('binary', data.binaryPath)
    if (!obj) {
      return NextResponse.json(
        { success: false, error: 'Binary file not found in storage — upload it before creating the dataset.' },
        { status: 400 }
      )
    }

    binaryUrl = obj.path // private bucket — store the path, sign at download time
    fileSizeBytes = obj.sizeBytes !== null ? BigInt(obj.sizeBytes) : null
  }

  if (data.samplePath) {
    if (!isExpectedPath('sample', data.title, data.samplePath)) {
      logger.warn({ userId: user.id, path: data.samplePath }, 'POST /api/v1/datasets — samplePath mismatch')
      return NextResponse.json(
        { success: false, error: 'samplePath does not match this dataset.' },
        { status: 400 }
      )
    }

    const obj = await getStoredObject('sample', data.samplePath)
    if (!obj) {
      return NextResponse.json(
        { success: false, error: 'Sample file not found in storage — upload it before creating the dataset.' },
        { status: 400 }
      )
    }

    sampleUrl = getSamplePublicUrl(data.samplePath) // public bucket — store the CDN URL
  }

  // ── 4. Create the Dodo product FIRST ──────────────────────
  // A dataset is purchasable the moment it's uploaded, so it needs a Dodo
  // product id. We mint the product before the DB insert: if Dodo fails we abort
  // with no DB row, rather than leaving a live-but-unpurchasable dataset behind.
  // (The opposite failure — an orphaned Dodo product if the insert below fails —
  // is harmless: it's just an unused product, never shown to anyone.)
  let dodoProductId: string
  try {
    dodoProductId = await createDatasetProduct({
      title: data.title,
      price: data.price,
      currency: data.currency,
    })
  } catch (error) {
    logger.error({ error, slug, userId: user.id }, 'POST /api/v1/datasets — Dodo product creation failed')
    return NextResponse.json(
      { success: false, error: 'Could not set up the dataset for sale. Please try again.' },
      { status: 502 }
    )
  }

  // ── 5. Insert into DB ─────────────────────────────────────
  try {
    const dataset = await prisma.dataset.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        industry: data.industry,
        category: data.category,
        language: data.language,
        tags: data.tags,
        price: data.price,
        currency: data.currency,
        fileFormat: data.fileFormat,
        rowCount: data.rowCount,
        // thumbnailUrl intentionally not set for now — thumbnails are out of scope.
        sampleUrl,
        binaryUrl,
        fileSizeBytes,
        dodoProductId,
      },
    })

    logger.info({ datasetId: dataset.id, slug: dataset.slug }, 'POST /api/v1/datasets — dataset created')

    // The new dataset is live immediately, so it should appear in the cached
    // browse list. It shows up within the list cache's 60s revalidate window;
    // for instant visibility, bust DATASETS_CACHE_TAG here once Next 16's
    // revalidateTag cache-profile arg is settled.

    // fileSizeBytes is a BigInt — JSON.stringify can't serialize it, so cast to
    // a string for the response (Prisma's Decimal `price` serializes on its own).
    return NextResponse.json(
      {
        success: true,
        data: { ...dataset, fileSizeBytes: dataset.fileSizeBytes?.toString() ?? null },
      },
      { status: 201 }
    )
  } catch (error) {
    // P2002 = unique constraint violation — here, a dataset with this slug
    // (derived from the title) already exists.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      logger.warn({ slug, userId: user.id }, 'POST /api/v1/datasets — duplicate slug')
      return NextResponse.json(
        { success: false, error: 'A dataset with this title already exists.' },
        { status: 409 }
      )
    }

    logger.error({ error, slug, userId: user.id }, 'POST /api/v1/datasets — create failed')
    return NextResponse.json(
      { success: false, error: 'Failed to create dataset. Please try again later.' },
      { status: 500 }
    )
  }
}
