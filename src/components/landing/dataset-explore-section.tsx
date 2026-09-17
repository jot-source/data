'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useDatasets } from '@/hooks/use-datasets'
import { useDatasetFacets } from '@/hooks/use-dataset-facets'
import { useDatasetFilters, type FacetKey } from '@/stores/dataset-filters.store'
import { DatasetCard } from '@/components/search-datasets/dataset-card'
import type { DatasetSort } from '@/validations/dataset.schema'

export function DatasetExploreSection() {
  // Data
  const { data, isPending } = useDatasets()
  const { data: facetsData } = useDatasetFacets()

  // State
  const { q, setSearch, facets, toggleFacet, clearAll, sort, setSort, minQuality, setMinQuality } = useDatasetFilters()
  const [draftSearch, setDraftSearch] = useState(q)
  const [prevQ, setPrevQ] = useState(q)

  if (q !== prevQ) {
    setPrevQ(q)
    setDraftSearch(q)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(draftSearch)
  }

  // Active filters for tags
  const activeTags: { label: string; onRemove: () => void }[] = []
  
  Object.entries(facets).forEach(([key, values]) => {
    values.forEach(val => {
      activeTags.push({
        label: val,
        onRemove: () => toggleFacet(key as FacetKey, val)
      })
    })
  })

  if (minQuality) {
    activeTags.push({
      label: `${minQuality}+ Quality`,
      onRemove: () => setMinQuality(null)
    })
  }

  return (
    <section className="w-full max-w-[100vw] overflow-x-hidden bg-[#EFF6FF] py-16 sm:py-[120px]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-5">
        <h2 className="mb-8 sm:mb-12 text-center text-2xl font-bold text-[#181818] md:text-3xl lg:text-[40px] leading-tight">
          We got every dataset you need. Search and explore now.
        </h2>

        <div className="rounded-3xl bg-[linear-gradient(90deg,#212F58_0%,#1B2237_50%,#212F58_100%)] p-4 md:p-8">
          {/* Search bar — search button nested on right corner */}
          <form onSubmit={handleSearch} className="mb-6 relative flex items-center rounded-xl bg-white p-1.5 pl-3 sm:pl-4 shadow-sm border border-transparent focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/20 transition-all">
            <input
              type="text"
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              placeholder="Eg: search health care datasets"
              className="flex-1 min-w-0 bg-transparent pr-2 sm:pr-3 py-2 text-sm text-[#181818] outline-none placeholder:text-[#8C8C8C]"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-[#2563EB] px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] active:scale-95"
            >
              Search
            </button>
          </form>

          {/* Filter bar */}
          <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm border border-[#E2E8F0]/60 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-bold text-[#181818]">Filter by</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-sm font-medium text-[#181818] transition-opacity hover:opacity-80 leading-6 inline-flex items-center justify-center h-6"
              >
                Clear all
              </button>
            </div>
            
            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-[10px]">
              <FilterDropdown 
                label="Industry" 
                count={facets.industry.length}
                options={facetsData?.industry?.map(f => f.value) || []}
                selected={facets.industry}
                onToggle={(val) => toggleFacet('industry', val)}
              />
              <FilterDropdown 
                label="Modality" 
                count={facets.modality.length}
                options={facetsData?.modality?.map(f => f.value) || []}
                selected={facets.modality}
                onToggle={(val) => toggleFacet('modality', val)}
              />
              
              {/* Sort Dropdown */}
              <SortDropdown sort={sort} setSort={setSort} />

              <FilterDropdown 
                label="License type" 
                count={facets.licenseType.length}
                options={facetsData?.licenseType?.map(f => f.value) || []}
                selected={facets.licenseType}
                onToggle={(val) => toggleFacet('licenseType', val)}
              />

              {/* Quality Dropdown */}
              <QualityDropdown quality={minQuality} setQuality={setMinQuality} />

              <FilterDropdown 
                label="More" 
                count={facets.useCase.length}
                options={facetsData?.useCase?.map(f => f.value) || []}
                selected={facets.useCase}
                onToggle={(val) => toggleFacet('useCase', val)}
              />
            </div>

            {/* Active tags */}
            {activeTags.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#F1F5F9]">
                {activeTags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex h-[32px] items-center gap-[10px] rounded-full border border-[#CBD5E1] bg-[#DBEAFE] px-4 py-2 text-xs font-medium text-[#0032B8]"
                  >
                    {tag.label}
                    <button type="button" onClick={tag.onRemove} className="text-[#0032B8] hover:opacity-75">
                      <XIcon />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Results count */}
          <p className="mb-4 text-sm font-semibold text-white">
            {isPending ? 'Loading...' : `${data?.pagination.total || 0} datasets match your results`}
          </p>

          {/* Dataset cards */}
          <div className="grid gap-4 sm:grid-cols-2 min-h-[300px]">
            {!isPending && data?.datasets.slice(0, 4).map((dataset) => (
              <DatasetCard key={dataset.id} dataset={dataset} />
            ))}
          </div>

          {/* View all button — white card button */}
          <div className="mt-8 flex justify-center">
            <Link
              href="/datasets"
              className="inline-flex h-[40px] items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 text-xs sm:text-sm font-medium text-[#0032B8] shadow-sm transition-all hover:bg-[#F8FAFC] active:scale-[0.98]"
            >
              View all {data?.pagination.total || 0} Datasets
              <ChevronRightIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// Helper components

function useOnClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler()
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

function FilterDropdown({ 
  label, 
  count, 
  options, 
  selected, 
  onToggle 
}: { 
  label: string
  count: number
  options: string[]
  selected: string[]
  onToggle: (val: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setOpen(false))

  const isActive = count > 0 || open

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-[36px] items-center gap-[10px] rounded-xl border border-[#CBD5E1] bg-[#DBEAFE] px-3 py-2 text-xs font-medium text-[#0032B8] transition-all hover:bg-[#C8DEFF]"
      >
        <span>{label}</span>
        {count > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0032B8] px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
        <ChevronDownIcon />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 max-h-60 w-52 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-xl">
          {options.length === 0 ? (
            <div className="px-2 py-1.5 text-xs text-[#8C8C8C]">No options</div>
          ) : (
            options.map(opt => (
              <label key={opt} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 hover:bg-[#EFF6FF] transition-colors">
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => onToggle(opt)}
                  className="rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span className="text-xs font-medium text-[#181818]">{opt}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const SORT_OPTIONS: { value: DatasetSort, label: string }[] = [
  { value: 'recent', label: 'Last updated' },
  { value: 'quality', label: 'Highest quality' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
]

function SortDropdown({ sort, setSort }: { sort: DatasetSort, setSort: (s: DatasetSort) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setOpen(false))

  const activeLabel = SORT_OPTIONS.find(o => o.value === sort)?.label

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-[36px] items-center gap-[10px] rounded-xl border border-[#CBD5E1] bg-[#DBEAFE] px-3 py-2 text-xs font-medium text-[#0032B8] transition-all hover:bg-[#C8DEFF]"
      >
        <span>Sort: {activeLabel}</span>
        <ChevronDownIcon />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-52 rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-xl">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setSort(opt.value); setOpen(false) }}
              className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${sort === opt.value ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#181818] hover:bg-[#F8FAFC]'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function QualityDropdown({ quality, setQuality }: { quality: number | null, setQuality: (q: number | null) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setOpen(false))

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-[36px] items-center gap-[10px] rounded-xl border border-[#CBD5E1] bg-[#DBEAFE] px-3 py-2 text-xs font-medium text-[#0032B8] transition-all hover:bg-[#C8DEFF]"
      >
        <span>Data quality score {quality !== null ? `(${quality}+)` : ''}</span>
        <ChevronDownIcon />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-48 rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-xl">
          {[9, 8, 7, 6].map(q => (
            <button
              key={q}
              onClick={() => { setQuality(quality === q ? null : q); setOpen(false) }}
              className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${quality === q ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#181818] hover:bg-[#F8FAFC]'}`}
            >
              {q}+ quality
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Icons

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
