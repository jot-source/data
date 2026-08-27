import { NextResponse } from 'next/server'
import { getCachedDatasetFacets } from '@/services/dataset.service'
import { logger } from '@/lib/logger'

/**
 * GET /api/v1/datasets/facets
 *
 * Returns the distinct values + counts for each sidebar facet
 * (industry, modality, useCase, licenseType) so the explore page can render its
 * checkbox lists and their trailing counts. Public route — no auth required.
 */
export async function GET() {
  try {
    const facets = await getCachedDatasetFacets()
    return NextResponse.json({ facets }, { status: 200 })
  } catch (error) {
    logger.error({ error }, 'GET /api/v1/datasets/facets — unhandled error, returning 500')
    return NextResponse.json(
      { error: 'Failed to fetch dataset facets. Please try again later.' },
      { status: 500 }
    )
  }
}
