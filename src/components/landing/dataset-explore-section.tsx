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
    <section className="w-full max-w-[100vw] overflow-x-hidden bg-[#EFF6FF] py-8 sm:py-16">
      <div className="mx-auto max-w-[1200px] px-3 sm:px-5">
        <h2 className="mb-5 sm:mb-10 text-center font-public-sans text-xs sm:text-2xl md:text-3xl font-medium sm:font-bold text-[#181818]">
          We got every dataset you need. Search and explore now.
        </h2>

        <div className="rounded-xl sm:rounded-3xl bg-[#283350] p-2.5 sm:p-4 md:p-8">
          {/* Search bar — magnifying glass on mobile per Figma, button on desktop */}
          <form onSubmit={handleSearch} className="mb-3 sm:mb-6 relative flex items-center rounded-lg sm:rounded-xl bg-white p-1 sm:p-1.5 pl-3 sm:pl-4 shadow-sm border border-transparent focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/20 transition-all">
            <input
              type="text"
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              placeholder="Eg: search health care datasets"
              className="flex-1 min-w-0 bg-transparent pr-2 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-sm text-[#181818] outline-none placeholder:text-[#616161] sm:placeholder:text-[#8C8C8C]"
            />
            {/* Mobile Magnifying Glass Icon */}
            <button
              type="submit"
              className="flex sm:hidden h-8 w-8 items-center justify-center text-[#8C8C8C] hover:text-[#2563EB]"
              aria-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            {/* Desktop Search Button */}
            <button
              type="submit"
              className="hidden sm:inline-flex shrink-0 rounded-md sm:rounded-lg bg-[#2563EB] px-3 sm:px-6 py-1.5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] active:scale-95"
            >
              Search
            </button>
          </form>

          {/* Filter bar */}
          <div className="mb-3 sm:mb-6 rounded-lg sm:rounded-2xl bg-white p-3 sm:p-5 border border-[#DDDDDD] sm:border-[#E2E8F0] shadow-sm">
            <div className="mb-2.5 sm:mb-3.5 flex items-center justify-between border-b border-[#DDDDDD] sm:border-transparent pb-2 sm:pb-0">
              <span className="text-xs sm:text-sm font-normal sm:font-bold text-[#181818]">Filter by</span>
              {activeTags.length > 0 && (
                <button type="button" onClick={clearAll} className="text-xs font-normal sm:font-semibold text-[#181818] sm:text-[#2563EB] hover:underline">
                  Clear all
                </button>
              )}
            </div>
            
            {/* Filter pills */}
            <div className="mb-1 flex flex-wrap gap-2 sm:gap-2.5">
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
              <div className="flex flex-wrap gap-2 pt-2.5 border-t border-[#F1F5F9] mt-2.5">
                {activeTags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-medium text-[#1E40AF]"
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
          <p className="mb-3 sm:mb-4 text-[10px] sm:text-sm font-normal sm:font-semibold text-white">
            {isPending ? 'Loading...' : `${data?.pagination.total || 0} datasets match your results`}
          </p>

          {/* Dataset cards */}
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 min-h-[300px]">
            {!isPending && data?.datasets.slice(0, 4).map((dataset) => (
              <DatasetCard key={dataset.id} dataset={dataset} />
            ))}
          </div>

          {/* View all button — 143x32 white with blue border on mobile, rich blue on tablet/desktop */}
          <div className="mt-5 sm:mt-8 flex justify-center">
            <Link
              href="/datasets"
              className="inline-flex h-8 sm:h-auto w-[143px] sm:w-auto items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-[#2563EB] bg-white sm:bg-[#2563EB] px-3 sm:px-8 py-1.5 sm:py-3.5 font-public-sans text-xs sm:text-sm font-normal sm:font-semibold text-[#2565EB] sm:text-white shadow-none sm:shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-all hover:bg-[#EFF6FF] sm:hover:bg-[#1D4ED8] active:scale-[0.98]"
            >
              View all datasets
              <span className="hidden sm:inline">({data?.pagination.total || 0})</span>
              <ArrowRightIcon />
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
        className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-[4px] sm:rounded-lg border px-2 py-1 sm:px-3.5 sm:py-2 text-[10px] sm:text-xs font-normal sm:font-semibold transition-all ${
          isActive 
            ? 'bg-[#DBEAFE] text-[#0032B8] border-[#CBD5E1]' 
            : 'bg-[#DBEAFE] sm:bg-[#F8FAFC] text-[#0032B8] sm:text-[#475569] border-[#CBD5E1] sm:border-[#E2E8F0] hover:bg-[#EFF6FF] hover:text-[#0032B8]'
        }`}
      >
        <span>{label}</span>
        {count > 0 && (
          <span className={`flex h-3.5 sm:h-4 min-w-3.5 sm:min-w-4 items-center justify-center rounded-full px-1 text-[9px] sm:text-[10px] font-bold ${isActive ? 'bg-[#2563EB] text-white' : 'bg-[#CBD5E1] text-[#1E293B]'}`}>
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
  const isActive = sort !== 'recent' || open

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-[4px] sm:rounded-lg border px-2 py-1 sm:px-3.5 sm:py-2 text-[10px] sm:text-xs font-normal sm:font-semibold transition-all ${
          isActive 
            ? 'bg-[#DBEAFE] text-[#0032B8] border-[#CBD5E1]' 
            : 'bg-[#DBEAFE] sm:bg-[#F8FAFC] text-[#0032B8] sm:text-[#475569] border-[#CBD5E1] sm:border-[#E2E8F0] hover:bg-[#EFF6FF] hover:text-[#0032B8]'
        }`}
      >
        <span className="sm:hidden">Sort by</span>
        <span className="hidden sm:inline">Sort: {activeLabel}</span>
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

  const isActive = quality !== null || open

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-[4px] sm:rounded-lg border px-2 py-1 sm:px-3.5 sm:py-2 text-[10px] sm:text-xs font-normal sm:font-semibold transition-all ${
          isActive 
            ? 'bg-[#DBEAFE] text-[#0032B8] border-[#CBD5E1]' 
            : 'bg-[#DBEAFE] sm:bg-[#F8FAFC] text-[#0032B8] sm:text-[#475569] border-[#CBD5E1] sm:border-[#E2E8F0] hover:bg-[#EFF6FF] hover:text-[#0032B8]'
        }`}
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
