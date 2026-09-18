import React from 'react'
import { Globe, Languages, Calendar, Tablet } from 'lucide-react'
import type { DatasetDetail } from '@/types/dataset'

function formatCount(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString()
}

export function Specifications({ dataset }: { dataset: DatasetDetail }) {
  // Left column specs
  const leftSpecs = [
    { label: 'Dataset type', value: dataset.modality || 'IMAGE/DCOM' },
    { label: 'Industry', value: dataset.industry || '—' },
    { label: 'Domain', value: dataset.useCase || dataset.category || '—' },
    { label: 'Language', value: dataset.languages?.length ? `${dataset.languages.length} languages` : dataset.language || '—' },
    { label: 'Country', value: dataset.countries?.length ? `${dataset.countries.length} countries` : '—' },
  ]

  // Right column specs
  const rightSpecs = [
    { label: 'Total records', value: formatCount(dataset.recordCount ? Number(dataset.recordCount) : null) },
    { label: 'File formats', value: dataset.fileFormat || '—' },
    { label: 'Resolution', value: '512×512 – 2048×2048' },
    { label: 'Annotation type', value: dataset.annotationType || '—' },
    { label: 'Storage type', value: dataset.fileSizeBytes ? `${(Number(dataset.fileSizeBytes) / (1024 ** 4)).toFixed(1)} TB` : '—' },
  ]

  // Info cards
  const infoCards = [
    {
      icon: <Globe className="h-9 w-9 text-[#2563EB]" strokeWidth={1.4} />,
      title: 'Countries',
      detail: dataset.countries?.length > 0 ? dataset.countries.join(', ') : 'Global',
    },
    {
      icon: <Languages className="h-9 w-9 text-[#2563EB]" strokeWidth={1.4} />,
      title: 'Languages',
      detail: dataset.languages?.length > 0 ? dataset.languages.join(', ') : 'English',
    },
    {
      icon: <Calendar className="h-9 w-9 text-[#2563EB]" strokeWidth={1.4} />,
      title: 'Collection period',
      detail: 'Jan 2023 – Mar 2026',
    },
    {
      icon: <Tablet className="h-9 w-9 text-[#2563EB]" strokeWidth={1.4} />,
      title: 'Device sources',
      detail: 'Siemens, GE, Philips imaging systems',
    },
  ]

  // AI use case tags
  const useCaseTags = dataset.tags?.length > 0
    ? dataset.tags
    : ['Medical AI', 'Object detection', 'Segmentation', 'OCR', 'Computer vision']

  return (
    <div id="specifications" className="scroll-mt-32 flex flex-col gap-6">
      {/* Spec Table */}
      <div className="rounded-[16px] md:rounded-2xl border border-[#E2E8F0] md:border-[#CBD5E1] bg-[#F8FAFC] md:bg-[#EFF6FF] p-4 md:p-5">
        <h2 className="mb-4 md:mb-5 text-lg md:text-xl font-semibold md:font-medium text-[#181818]">
          <span className="md:hidden">Specifications</span>
          <span className="hidden md:inline">Dataset specifications</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-0 md:gap-4">
          {/* Left column */}
          <div className="flex-1 md:rounded-lg md:px-3 md:py-3">
            {leftSpecs.map((spec, i) => (
              <div key={i} className="border-b border-[#E2E8F0] md:border-[#8C8C8C]/30 md:last:border-none">
                <div className="flex items-center justify-between py-3 md:py-2.5">
                  <span className="text-sm text-[#8C8C8C]">{spec.label}</span>
                  <span className="text-sm font-semibold md:font-medium text-[#181818]">{spec.value}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Right column */}
          <div className="flex-1 md:rounded-lg md:px-3 md:py-3">
            {rightSpecs.map((spec, i) => (
              <div key={i} className="border-b border-[#E2E8F0] md:border-[#8C8C8C]/30 last:border-none">
                <div className="flex items-center justify-between py-3 md:py-2.5">
                  <span className="text-sm text-[#8C8C8C]">{spec.label}</span>
                  <span className="text-sm font-semibold md:font-medium text-[#181818]">{spec.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {infoCards.map((card, i) => (
          <div key={i} className="flex flex-col items-start gap-3 md:gap-6 rounded-[12px] md:rounded-xl border border-[#E2E8F0] md:border-[#CBD5E1] bg-white p-4 sm:p-6">
            <div>{card.icon}</div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold md:font-medium text-[#181818]">{card.title}</span>
              <span className="text-xs text-[#616161] leading-4">{card.detail}</span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Use Cases */}
      <div className="rounded-[12px] md:rounded-2xl border border-[#E2E8F0] md:border-[#CBD5E1] bg-white p-3 md:p-5 flex flex-col gap-4 md:gap-0">
        <h2 className="md:mb-5 text-base md:text-xl font-medium text-[#181818]">AI use cases</h2>
        <div className="flex flex-wrap gap-3 md:gap-4">
          {useCaseTags.map((tag: string, i: number) => (
            <span key={i} className="inline-flex items-center gap-2.5 rounded-full border border-[#CBD5E1] bg-[#DBEAFE] px-3 py-1.5 md:px-6 md:py-2 text-xs md:text-sm font-medium text-[#2565EB]">
              <span className="inline-block h-1 w-1 rounded-full bg-[#2565EB]"></span>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
