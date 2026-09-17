'use client'

import { useState } from 'react'
import { useDatasets } from '@/hooks/use-datasets'
import { useDatasetFilters } from '@/stores/dataset-filters.store'
import type { DatasetSort } from '@/validations/dataset.schema'
import { DatasetCard } from './dataset-card'
import { DatasetCardSkeleton } from './dataset-card-skeleton'
import { MobileFiltersModal } from './mobile-filters-modal'

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
    <label className="flex items-center gap-1.5 font-public-sans text-base font-medium leading-[24px] text-[#2B2B2B]">
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as DatasetSort)}
        className="cursor-pointer appearance-none rounded-md border-none bg-transparent py-1 pr-1 font-medium text-[#2B2B2B] focus:outline-none"
      >
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <svg width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden="true">
        <path d="M1 1l5 5 5-5" stroke="#2B2B2B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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
  const sort = useDatasetFilters((s) => s.sort)
  const setSort = useDatasetFilters((s) => s.setSort)
  const facets = useDatasetFilters((s) => s.facets)
  const minQuality = useDatasetFilters((s) => s.minQuality)
  const [filterModalOpen, setFilterModalOpen] = useState(false)

  const activeFiltersCount = Object.values(facets).reduce((acc, v) => acc + v.length, 0) + (minQuality ? 1 : 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Desktop Controls Row (>= 768px) */}
      <div className="hidden md:flex items-center justify-between pt-1 font-public-sans">
        <p className="font-public-sans text-base font-medium leading-[24px] text-[#2B2B2B]">
          {isPending
            ? 'Loading datasets…'
            : `${data?.pagination.total ?? 0} datasets match your results`}
        </p>
        <SortDropdown />
      </div>

      {/* Mobile Controls Row (< 768px) per Figma uploaded_media_6 */}
      <div className="flex md:hidden items-center justify-between pt-1 pb-1 font-public-sans">
        <span className="font-public-sans text-xs font-semibold text-[#181818]">
          {isPending ? 'Loading...' : `${data?.pagination.total ?? 0} datasets matched`}
        </span>

        <div className="flex items-center gap-2">
          {/* Filters Button with Sliders Icon */}
          <button
            type="button"
            onClick={() => setFilterModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 font-public-sans text-xs font-medium text-[#181818] shadow-2xs hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-[10px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort By Dropdown Button */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as DatasetSort)}
              className="appearance-none rounded-lg border border-[#CBD5E1] bg-white pl-3 pr-6 py-1.5 font-public-sans text-xs font-medium text-[#181818] shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="recent">Sort by: Recent</option>
              <option value="quality">Sort by: Quality</option>
              <option value="price_asc">Sort by: Price ↑</option>
              <option value="price_desc">Sort by: Price ↓</option>
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B]">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <MobileFiltersModal isOpen={filterModalOpen} onClose={() => setFilterModalOpen(false)} />

      {isError && (
        <p className="rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 font-public-sans text-sm text-[#B91C1C]">
          Failed to load datasets. Please try again.
        </p>
      )}

      {!isError && !isPending && data && data.datasets.length === 0 && (
        <p className="rounded-lg border border-[#E5E5E5] bg-white px-4 py-8 text-center font-public-sans text-sm text-[#8C8C8C]">
          No datasets match your filters. Try clearing some of them.
        </p>
      )}

      {isPending ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <DatasetCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-5 md:grid-cols-2 ${isPlaceholderData ? 'opacity-60' : 'opacity-100'}`}
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
      )}

      {data && (
        <Pagination page={page} totalPages={data.pagination.totalPages} onChange={setPage} />
      )}
    </div>
  )
}
