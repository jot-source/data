'use client'

import { useState } from 'react'
import { useDatasetFacets } from '@/hooks/use-dataset-facets'
import {
  useDatasetFilters,
  type FacetKey,
} from '@/stores/dataset-filters.store'
import { cn } from '@/lib/utils'

const DEFAULT_INDUSTRIES = [
  { value: 'Healthcare', count: 32 },
  { value: 'Conversational AI', count: 18 },
  { value: 'Robotics', count: 8 },
  { value: 'BFSI', count: 8 },
]

const DEFAULT_MODALITIES = [
  { value: 'Text', count: 24 },
  { value: 'Image', count: 16 },
  { value: 'Audio', count: 12 },
  { value: 'Video', count: 8 },
]

const DEFAULT_USECASES = [
  { value: 'Healthcare Diagnosis', count: 14 },
  { value: 'Fraud Detection', count: 9 },
  { value: 'Autonomous Driving', count: 7 },
  { value: 'Customer Support', count: 11 },
]

const DEFAULT_LICENSES = [
  { value: 'Commercial', count: 28 },
  { value: 'Research', count: 15 },
  { value: 'Enterprise', count: 8 },
]

const QUALITY_THRESHOLDS = [9, 8, 7, 6]

export function MobileFiltersModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { data: facetsData } = useDatasetFacets()
  const { facets, toggleFacet, minQuality, setMinQuality, clearAll } = useDatasetFilters()
  const [openSection, setOpenSection] = useState<string | null>('industry')

  if (!isOpen) return null

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section))
  }

  const industryOptions = (facetsData?.industry && facetsData.industry.length > 0)
    ? facetsData.industry
    : DEFAULT_INDUSTRIES

  const modalityOptions = (facetsData?.modality && facetsData.modality.length > 0)
    ? facetsData.modality
    : DEFAULT_MODALITIES

  const useCaseOptions = (facetsData?.useCase && facetsData.useCase.length > 0)
    ? facetsData.useCase
    : DEFAULT_USECASES

  const licenseOptions = (facetsData?.licenseType && facetsData.licenseType.length > 0)
    ? facetsData.licenseType
    : DEFAULT_LICENSES

  return (
    <div className="fixed inset-0 z-[110] md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Sheet */}
      <div className="fixed inset-x-0 bottom-0 top-16 z-[111] flex flex-col rounded-t-2xl bg-white shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4">
          <h3 className="font-public-sans text-base font-medium text-[#2B2B2B] uppercase">
            FILTERS
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8C8C8C] hover:bg-[#F1F5F9] hover:text-[#181818] text-base cursor-pointer"
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>

        {/* Content Accordion */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {/* Industry */}
          <div className="border-b border-[#F1F5F9]">
            <button
              type="button"
              onClick={() => toggleSection('industry')}
              className="flex w-full items-center justify-between font-public-sans text-sm font-medium text-[#181818] py-3"
            >
              <div className="flex items-center gap-2">
                <span>Industry</span>
                {facets.industry.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#DBEAFE] text-[10px] font-bold text-[#2563EB]">
                    {facets.industry.length}
                  </span>
                )}
              </div>
              <ChevronIcon open={openSection === 'industry'} />
            </button>
            {openSection === 'industry' && (
              <div className="flex flex-col pl-1 max-h-[240px] overflow-y-auto pr-1 border-t border-[#F1F5F9] pt-2 pb-2">
                {industryOptions.map((opt) => {
                  const isChecked = facets.industry.includes(opt.value)
                  return (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 transition-colors',
                        isChecked ? 'bg-[#EFF6FF]' : 'hover:bg-[#F8FAFC]'
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFacet('industry', opt.value)}
                          className="h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                        />
                        <span className={cn('font-public-sans text-sm', isChecked ? 'font-medium text-[#181818]' : 'font-normal text-[#444444]')}>
                          {opt.value}
                        </span>
                      </span>
                      <span className="font-public-sans text-sm text-[#8C8C8C]">
                        {String(opt.count).padStart(2, '0')}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* Modality */}
          <div className="border-b border-[#F1F5F9]">
            <button
              type="button"
              onClick={() => toggleSection('modality')}
              className="flex w-full items-center justify-between font-public-sans text-sm font-medium text-[#181818] py-3"
            >
              <div className="flex items-center gap-2">
                <span>Modality</span>
                {facets.modality.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#DBEAFE] text-[10px] font-bold text-[#2563EB]">
                    {facets.modality.length}
                  </span>
                )}
              </div>
              <ChevronIcon open={openSection === 'modality'} />
            </button>
            {openSection === 'modality' && (
              <div className="flex flex-col pl-1 max-h-[240px] overflow-y-auto pr-1 border-t border-[#F1F5F9] pt-2 pb-2">
                {modalityOptions.map((opt) => {
                  const isChecked = facets.modality.includes(opt.value)
                  return (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 transition-colors',
                        isChecked ? 'bg-[#EFF6FF]' : 'hover:bg-[#F8FAFC]'
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFacet('modality', opt.value)}
                          className="h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                        />
                        <span className={cn('font-public-sans text-sm', isChecked ? 'font-medium text-[#181818]' : 'font-normal text-[#444444]')}>
                          {opt.value}
                        </span>
                      </span>
                      <span className="font-public-sans text-sm text-[#8C8C8C]">
                        {String(opt.count).padStart(2, '0')}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* Usecase */}
          <div className="border-b border-[#F1F5F9]">
            <button
              type="button"
              onClick={() => toggleSection('usecase')}
              className="flex w-full items-center justify-between font-public-sans text-sm font-medium text-[#181818] py-3"
            >
              <div className="flex items-center gap-2">
                <span>Usecase</span>
                {facets.useCase.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#DBEAFE] text-[10px] font-bold text-[#2563EB]">
                    {facets.useCase.length}
                  </span>
                )}
              </div>
              <ChevronIcon open={openSection === 'usecase'} />
            </button>
            {openSection === 'usecase' && (
              <div className="flex flex-col pl-1 max-h-[240px] overflow-y-auto pr-1 border-t border-[#F1F5F9] pt-2 pb-2">
                {useCaseOptions.map((opt) => {
                  const isChecked = facets.useCase.includes(opt.value)
                  return (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 transition-colors',
                        isChecked ? 'bg-[#EFF6FF]' : 'hover:bg-[#F8FAFC]'
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFacet('useCase', opt.value)}
                          className="h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                        />
                        <span className={cn('font-public-sans text-sm', isChecked ? 'font-medium text-[#181818]' : 'font-normal text-[#444444]')}>
                          {opt.value}
                        </span>
                      </span>
                      <span className="font-public-sans text-sm text-[#8C8C8C]">
                        {String(opt.count).padStart(2, '0')}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* License type */}
          <div className="border-b border-[#F1F5F9]">
            <button
              type="button"
              onClick={() => toggleSection('license')}
              className="flex w-full items-center justify-between font-public-sans text-sm font-medium text-[#181818] py-3"
            >
              <div className="flex items-center gap-2">
                <span>License type</span>
                {facets.licenseType.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#DBEAFE] text-[10px] font-bold text-[#2563EB]">
                    {facets.licenseType.length}
                  </span>
                )}
              </div>
              <ChevronIcon open={openSection === 'license'} />
            </button>
            {openSection === 'license' && (
              <div className="flex flex-col pl-1 max-h-[240px] overflow-y-auto pr-1 border-t border-[#F1F5F9] pt-2 pb-2">
                {licenseOptions.map((opt) => {
                  const isChecked = facets.licenseType.includes(opt.value)
                  return (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 transition-colors',
                        isChecked ? 'bg-[#EFF6FF]' : 'hover:bg-[#F8FAFC]'
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFacet('licenseType', opt.value)}
                          className="h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                        />
                        <span className={cn('font-public-sans text-sm', isChecked ? 'font-medium text-[#181818]' : 'font-normal text-[#444444]')}>
                          {opt.value}
                        </span>
                      </span>
                      <span className="font-public-sans text-sm text-[#8C8C8C]">
                        {String(opt.count).padStart(2, '0')}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* Data quality score */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('quality')}
              className="flex w-full items-center justify-between font-public-sans text-sm font-medium text-[#181818] py-3"
            >
              <div className="flex items-center gap-2">
                <span>Data quality score</span>
                {minQuality && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#DBEAFE] text-[10px] font-bold text-[#2563EB]">
                    1
                  </span>
                )}
              </div>
              <ChevronIcon open={openSection === 'quality'} />
            </button>
            {openSection === 'quality' && (
              <div className="mt-2 flex flex-wrap gap-2 pl-1">
                {QUALITY_THRESHOLDS.map((threshold) => {
                  const active = minQuality === threshold
                  return (
                    <button
                      key={threshold}
                      type="button"
                      onClick={() => setMinQuality(active ? null : threshold)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 font-public-sans text-xs font-semibold transition-all',
                        active
                          ? 'border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]'
                          : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
                      )}
                    >
                      {threshold}+ quality
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="flex items-center gap-3 border-t border-[#F1F5F9] bg-white p-4 shadow-lg">
          <button
            type="button"
            onClick={clearAll}
            className="flex-1 h-11 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] font-public-sans text-sm font-semibold text-[#181818] hover:bg-[#F1F5F9] transition-colors"
          >
            Reset all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-lg bg-[#2563EB] font-public-sans text-sm font-semibold text-white hover:bg-[#1D4ED8] shadow-sm transition-colors"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="7"
      viewBox="0 0 12 7"
      fill="none"
      className={cn('transition-transform duration-200 text-[#8C8C8C]', open && 'rotate-180 text-[#2563EB]')}
    >
      <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
