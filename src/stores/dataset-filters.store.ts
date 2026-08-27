// stores/dataset-filters.store.ts
// Zustand store for the explore page's filter UI (search, sidebar facets,
// quality, sort, page). UI-only client state — the actual dataset results come
// from TanStack Query, which reads this store's snapshot as its query key
// (see hooks/use-datasets.ts). Per docs/tech-stack-decisions.md: Zustand for
// UI state, TanStack Query for anything from the API/DB.
import { create } from 'zustand'
import type { DatasetSort } from '@/validations/dataset.schema'

/** Multi-select facet keys — each holds the list of checked option values. */
export type FacetKey =
  | 'industry'
  | 'modality'
  | 'useCase'
  | 'licenseType'
  | 'compliance'
  | 'annotationType'
  | 'collectionMethod'

export type DatasetFacetSelections = Record<FacetKey, string[]>

const EMPTY_FACETS: DatasetFacetSelections = {
  industry: [],
  modality: [],
  useCase: [],
  licenseType: [],
  compliance: [],
  annotationType: [],
  collectionMethod: [],
}

interface DatasetFiltersState {
  /** Committed search term (updated on submit, not each keystroke). */
  q: string
  facets: DatasetFacetSelections
  minQuality: number | null
  sort: DatasetSort
  page: number

  setSearch: (q: string) => void
  toggleFacet: (key: FacetKey, value: string) => void
  setMinQuality: (score: number | null) => void
  setSort: (sort: DatasetSort) => void
  setPage: (page: number) => void
  clearAll: () => void
}

export const useDatasetFilters = create<DatasetFiltersState>((set) => ({
  q: '',
  facets: EMPTY_FACETS,
  minQuality: null,
  sort: 'recent',
  page: 1,

  // Any filter change resets to page 1 so the user never lands on an
  // out-of-range page for the new result set.
  setSearch: (q) => set({ q, page: 1 }),

  toggleFacet: (key, value) =>
    set((state) => {
      const current = state.facets[key]
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { facets: { ...state.facets, [key]: next }, page: 1 }
    }),

  setMinQuality: (minQuality) => set({ minQuality, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setPage: (page) => set({ page }),

  clearAll: () =>
    set({ q: '', facets: EMPTY_FACETS, minQuality: null, sort: 'recent', page: 1 }),
}))

/** True when any filter (search, facet, quality) is active. */
export function hasActiveFilters(state: DatasetFiltersState): boolean {
  return (
    state.q.trim() !== '' ||
    state.minQuality !== null ||
    Object.values(state.facets).some((values) => values.length > 0)
  )
}
