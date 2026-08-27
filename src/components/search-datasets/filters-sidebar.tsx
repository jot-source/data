// components/datasets/filters-sidebar.tsx
// Left "FILTERS" panel. Options + counts for the four main facets come from
// GET /api/v1/datasets/facets (useDatasetFacets); the checked state lives in
// the Zustand filter store and is what actually drives the dataset query.
'use client'

import { useState } from 'react'
import { useDatasetFacets } from '@/hooks/use-dataset-facets'
import {
  useDatasetFilters,
  hasActiveFilters,
  type FacetKey,
} from '@/stores/dataset-filters.store'
import type { FacetCount } from '@/types/dataset'
import { FilterSection } from './filter-section'

// Advanced-filter facets have no dedicated counts endpoint (they're secondary,
// low-traffic filters) — offered as fixed option lists instead.
const ANNOTATION_TYPES = ['Bounding Box', 'Segmentation', 'Classification Label', 'None']
const COLLECTION_METHODS = ['Real-world', 'Synthetic', 'Crowdsourced']
const QUALITY_THRESHOLDS = [9, 8, 7, 6]

function FacetCheckboxList({
  facetKey,
  options,
}: {
  facetKey: FacetKey
  options: FacetCount[]
}) {
  const selected = useDatasetFilters((s) => s.facets[facetKey])
  const toggleFacet = useDatasetFilters((s) => s.toggleFacet)

  if (options.length === 0) {
    return <p className="font-public-sans text-xs text-[#8C8C8C]">No options yet.</p>
  }

  return (
    <ul className="flex max-h-48 flex-col gap-2 overflow-y-auto">
      {options.map((option) => (
        <li key={option.value}>
          <label className="flex cursor-pointer items-center justify-between gap-2 rounded px-1 py-0.5 hover:bg-[#F5F7FA]">
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggleFacet(facetKey, option.value)}
                className="h-4 w-4 rounded border-[#DDDDDD] text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span className="font-public-sans text-sm text-[#181818]">{option.value}</span>
            </span>
            <span className="font-public-sans text-xs text-[#8C8C8C]">
              {String(option.count).padStart(2, '0')}
            </span>
          </label>
        </li>
      ))}
    </ul>
  )
}

function StaticCheckboxList({ facetKey, options }: { facetKey: FacetKey; options: string[] }) {
  const selected = useDatasetFilters((s) => s.facets[facetKey])
  const toggleFacet = useDatasetFilters((s) => s.toggleFacet)

  return (
    <ul className="flex flex-col gap-2">
      {options.map((option) => (
        <li key={option}>
          <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-[#F5F7FA]">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggleFacet(facetKey, option)}
              className="h-4 w-4 rounded border-[#DDDDDD] text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span className="font-public-sans text-sm text-[#181818]">{option}</span>
          </label>
        </li>
      ))}
    </ul>
  )
}

function QualityScoreFilter() {
  const minQuality = useDatasetFilters((s) => s.minQuality)
  const setMinQuality = useDatasetFilters((s) => s.setMinQuality)

  return (
    <div className="flex flex-wrap gap-2">
      {QUALITY_THRESHOLDS.map((threshold) => {
        const active = minQuality === threshold
        return (
          <button
            key={threshold}
            type="button"
            onClick={() => setMinQuality(active ? null : threshold)}
            className={`rounded-lg border px-3 py-1.5 font-public-sans text-xs font-semibold transition-all ${
              active
                ? 'border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]'
                : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#181818]'
            }`}
          >
            {threshold}+ quality
          </button>
        )
      })}
    </div>
  )
}

export function FiltersSidebar() {
  const { data: facets } = useDatasetFacets()
  const clearAll = useDatasetFilters((s) => s.clearAll)
  const active = useDatasetFilters(hasActiveFilters)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <span className="font-public-sans text-xs font-semibold tracking-wide text-[#8C8C8C]">
          FILTERS
        </span>
        {active && (
          <button
            type="button"
            onClick={clearAll}
            className="font-public-sans text-xs font-medium text-[#2563EB] hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterSection title="Industry" defaultOpen>
        <FacetCheckboxList facetKey="industry" options={facets?.industry ?? []} />
      </FilterSection>

      <FilterSection title="Modality">
        <FacetCheckboxList facetKey="modality" options={facets?.modality ?? []} />
      </FilterSection>

      <FilterSection title="Usecase">
        <FacetCheckboxList facetKey="useCase" options={facets?.useCase ?? []} />
      </FilterSection>

      <FilterSection title="License type">
        <FacetCheckboxList facetKey="licenseType" options={facets?.licenseType ?? []} />
      </FilterSection>

      <FilterSection title="Data quality score">
        <QualityScoreFilter />
      </FilterSection>

      <button
        type="button"
        onClick={() => setAdvancedOpen((v) => !v)}
        className="mt-6 flex items-center justify-center gap-1 border-t border-[#E5E5E5] pt-6 pb-1 font-public-sans text-sm text-[#8C8C8C] hover:text-[#616161]"
      >
        Advanced filters
        <svg
          width="14"
          height="8"
          viewBox="0 0 14 8"
          fill="none"
          className={`transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="M1 1l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {advancedOpen && (
        <>
          <FilterSection title="Annotation type">
            <StaticCheckboxList facetKey="annotationType" options={ANNOTATION_TYPES} />
          </FilterSection>
          <FilterSection title="Collection method">
            <StaticCheckboxList facetKey="collectionMethod" options={COLLECTION_METHODS} />
          </FilterSection>
        </>
      )}
    </div>
  )
}
