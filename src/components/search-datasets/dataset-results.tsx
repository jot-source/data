// components/datasets/dataset-results.tsx
// The right-hand pane of the explore page: result count + sort dropdown,
// the card grid itself, and pagination. This is the ONLY part of the explore
// page that scrolls internally — the filters sidebar stays put (see
// app/(public)/datasets/page.tsx for the split-scroll layout).
'use client'

import { useDatasets } from '@/hooks/use-datasets'
import { useDatasetFilters } from '@/stores/dataset-filters.store'
import type { DatasetSort } from '@/validations/dataset.schema'
import { DatasetCard } from './dataset-card'

const SORT_LABELS: Record<DatasetSort, string> = {
  recent: 'Last updated',
  quality: 'Highest quality',
  price_asc: 'Price: low to high',
  price_desc: 'Price: high to low',
}

function SortDropdown() {
  const sort = useDatasetFilters((s) => s.sort)
  const setSort = useDatasetFilters((s) => s.setSort)

  return (
    <label className="flex items-center gap-1.5 font-public-sans text-sm text-[#181818]">
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as DatasetSort)}
        className="cursor-pointer appearance-none rounded-md border-none bg-transparent py-1 pr-1 font-medium focus:outline-none"
      >
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <svg width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden="true">
        <path d="M1 1l5 5 5-5" stroke="#616161" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  )
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 pb-4 pt-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-md border border-[#DDDDDD] px-3 py-1.5 font-public-sans text-sm text-[#181818] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Prev
      </button>
      <span className="font-public-sans text-sm text-[#616161]">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-md border border-[#DDDDDD] px-3 py-1.5 font-public-sans text-sm text-[#181818] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  )
}

export function DatasetResults({
  isLoggedIn = false,
  savedDatasetIds = [],
}: {
  isLoggedIn?: boolean
  savedDatasetIds?: string[]
}) {
  const savedSet = new Set(savedDatasetIds)
  const { data, isPending, isError, isPlaceholderData } = useDatasets()
  const page = useDatasetFilters((s) => s.page)
  const setPage = useDatasetFilters((s) => s.setPage)

  return (
    <div className="flex flex-col gap-4 px-8 py-6">
      <div className="flex items-center justify-between">
        <p className="font-public-sans text-sm text-[#616161]">
          {isPending
            ? 'Loading datasets…'
            : `${data?.pagination.total ?? 0} datasets match your results`}
        </p>
        <SortDropdown />
      </div>

      {isError && (
        <p className="rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 font-public-sans text-sm text-[#B91C1C]">
          Failed to load datasets. Please try again.
        </p>
      )}

      {!isError && data && data.datasets.length === 0 && (
        <p className="rounded-lg border border-[#E5E5E5] bg-white px-4 py-8 text-center font-public-sans text-sm text-[#8C8C8C]">
          No datasets match your filters. Try clearing some of them.
        </p>
      )}

      <div
        className={`grid grid-cols-1 gap-4 transition-opacity md:grid-cols-2 ${
          isPlaceholderData ? 'opacity-60' : 'opacity-100'
        }`}
      >
        {data?.datasets.map((dataset) => (
          <DatasetCard
            key={dataset.id}
            dataset={dataset}
            isLoggedIn={isLoggedIn}
            isSaved={savedSet.has(dataset.id)}
          />
        ))}
      </div>

      {data && (
        <Pagination page={page} totalPages={data.pagination.totalPages} onChange={setPage} />
      )}
    </div>
  )
}
