'use client'

import { useQuery } from '@tanstack/react-query'
import { useDatasetFilters } from '@/stores/dataset-filters.store'
import type { DatasetsListResponse } from '@/types/dataset'

const PAGE_SIZE = 12

/** Builds the GET /api/v1/datasets query string from the current filter store snapshot. */
function buildSearchParams(filters: ReturnType<typeof useDatasetFilters.getState>): URLSearchParams {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('limit', String(PAGE_SIZE))
  params.set('sort', filters.sort)

  if (filters.q.trim()) params.set('q', filters.q.trim())
  if (filters.minQuality !== null) params.set('minQuality', String(filters.minQuality))

  for (const [key, values] of Object.entries(filters.facets)) {
    if (values.length > 0) params.set(key, values.join(','))
  }

  return params
}

async function fetchDatasets(params: URLSearchParams): Promise<DatasetsListResponse> {
  const res = await fetch(`/api/v1/datasets?${params.toString()}`)
  const body = await res.json()

  if (!res.ok) {
    throw new Error(body?.error ?? 'Failed to load datasets.')
  }

  return body as DatasetsListResponse
}

/**
 * Fetches the paginated, filtered dataset list for the explore page. The query
 * key mirrors every filter-store field the API reads, so any change to search,
 * facets, quality, sort, or page automatically triggers a refetch.
 */
export function useDatasets() {
  const { q, facets, minQuality, sort, page } = useDatasetFilters()

  return useQuery({
    queryKey: ['datasets', { q, facets, minQuality, sort, page }],
    queryFn: () => fetchDatasets(buildSearchParams(useDatasetFilters.getState())),
    placeholderData: (previousData) => previousData, // keep old page visible while the next one loads
  })
}
