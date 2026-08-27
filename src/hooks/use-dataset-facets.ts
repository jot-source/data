'use client'

import { useQuery } from '@tanstack/react-query'
import type { DatasetFacets } from '@/types/dataset'

async function fetchFacets(): Promise<DatasetFacets> {
  const res = await fetch('/api/v1/datasets/facets')
  const body = await res.json()

  if (!res.ok) {
    throw new Error(body?.error ?? 'Failed to load filters.')
  }

  return body.facets as DatasetFacets
}

/**
 * Sidebar facet options (industry, modality, useCase, licenseType) + their
 * counts. Independent of the active filter selections — always shows the full
 * catalogue's distribution, per the explore page's Figma spec (e.g. "Healthcare 32").
 */
export function useDatasetFacets() {
  return useQuery({
    queryKey: ['dataset-facets'],
    queryFn: fetchFacets,
    staleTime: 1000 * 60 * 10, // facets change rarely — cache longer than the default 5 min
  })
}
