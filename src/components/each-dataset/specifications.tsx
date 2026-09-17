import React from 'react'
import { Globe, Languages, Calendar, HardDrive } from 'lucide-react'
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
      icon: <Globe className="h-12 w-12 text-[#2563EB] stroke-[1.75]" />,
      title: 'Countries',
      detail: dataset.countries?.length > 0 ? dataset.countries.join(', ') : 'Global',
    },
    {
      icon: <Languages className="h-12 w-12 text-[#2563EB] stroke-[1.75]" />,
      title: 'Languages',
      detail: dataset.languages?.length > 0 ? dataset.languages.join(', ') : 'English',
    },
    {
      icon: <Calendar className="h-12 w-12 text-[#2563EB] stroke-[1.75]" />,
      title: 'Collection period',
      detail: 'Jan 2023 – Mar 2026',
    },
    {
      icon: <HardDrive className="h-12 w-12 text-[#2563EB] stroke-[1.75]" />,
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
      <div className="rounded-2xl border border-[#CBD5E1] bg-[#EFF6FF] p-5">
        <h2 className="mb-5 text-xl font-medium text-[#181818]">Dataset specifications</h2>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left column */}
          <div className="flex-1 rounded-lg px-2 sm:px-3 py-2 sm:py-3">
            {leftSpecs.map((spec, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-[#8C8C8C]">{spec.label}</span>
                  <span className="text-sm font-medium text-[#181818]">{spec.value}</span>
                </div>
                {i < leftSpecs.length - 1 && <div className="border-b border-[#8C8C8C]/30"></div>}
              </React.Fragment>
            ))}
          </div>
          {/* Right column */}
          <div className="flex-1 rounded-lg px-2 sm:px-3 py-2 sm:py-3">
            {rightSpecs.map((spec, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-[#8C8C8C]">{spec.label}</span>
                  <span className="text-sm font-medium text-[#181818]">{spec.value}</span>
                </div>
                {i < rightSpecs.length - 1 && <div className="border-b border-[#8C8C8C]/30"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {infoCards.map((card, i) => (
          <div key={i} className="flex flex-col items-start gap-6 rounded-xl border border-[#CBD5E1] bg-white p-6">
            <div>{card.icon}</div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[#181818]">{card.title}</span>
              <span className="text-xs text-[#616161] leading-4">{card.detail}</span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Use Cases */}
      <div className="rounded-2xl border border-[#CBD5E1] bg-white p-5">
        <h2 className="mb-5 text-xl font-medium text-[#181818]">AI use cases</h2>
        <div className="flex flex-wrap gap-4">
          {useCaseTags.map((tag: string, i: number) => (
            <span key={i} className="inline-flex items-center gap-2.5 rounded-full border border-[#CBD5E1] bg-[#DBEAFE] px-6 py-2 text-sm font-medium text-[#2565EB]">
              <span className="inline-block h-1 w-1 rounded-full bg-[#2565EB]"></span>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
