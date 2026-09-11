'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { toggleSaveDataset } from '@/actions/saved-dataset.actions'
import type { DatasetCard } from '@/types/dataset'

interface SavedDatasetsProps {
  initialDatasets?: (DatasetCard & { savedAt: string })[]
}

export function SavedDatasets({ initialDatasets = [] }: SavedDatasetsProps) {
  const [datasets, setDatasets] = useState(initialDatasets)

  return (
    <div className="w-full" id="wishlist-section">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Wishlist</h2>
        <p className="text-sm text-gray-500 mt-1">Review and manage the datasets you&apos;ve saved</p>
      </div>

      {datasets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <h3 className="mb-1 text-base font-semibold text-gray-900">No saved datasets yet</h3>
          <p className="mb-6 text-sm text-gray-500">Explore the marketplace to save datasets you&apos;re interested in.</p>
          
          <Link
            href="/datasets"
            className="rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Browse datasets
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {datasets.map((dataset) => (
            <WishlistDatasetCard
              key={dataset.id}
              dataset={dataset}
              onRemoved={(id) => setDatasets((prev) => prev.filter((d) => d.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function WishlistDatasetCard({
  dataset,
  onRemoved,
}: {
  dataset: DatasetCard & { savedAt: string }
  onRemoved: (id: string) => void
}) {
  const [isPending, startTransition] = useTransition()

  function handleUnsave() {
    startTransition(async () => {
      const result = await toggleSaveDataset(dataset.id)
      if (!result.error && result.saved === false) {
        onRemoved(dataset.id)
      }
    })
  }

  // Fallbacks for display fields matching Figma mock
  const datasetCode = dataset.datasetCode || 'DS-1032'
  const industry = dataset.industry || 'Healthcare'
  const recordCount = dataset.recordCount ? `${(Number(dataset.recordCount) / 1000000).toFixed(1)}M` : '1.8M'
  const recordUnit = dataset.recordUnit || 'scans'
  const qualityScore = dataset.qualityScore || 9.2
  const fileFormat = dataset.fileFormat || 'DICOM format'
  const compliance = dataset.compliance && dataset.compliance.length > 0 ? dataset.compliance[0] : 'IRB-compliant'

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {/* Top Row: Icon + Title + Status Badge */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Dark Navy Square Icon Box */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1936] text-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="6" width="13" height="12" rx="2" stroke="white" strokeWidth="1.8" />
              <path d="M16 10l5-2.5v9L16 14" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900">{dataset.title}</h3>
            <p className="mt-0.5 text-xs text-gray-500 font-medium">
              {datasetCode} • {industry}
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#059669]">
          Sample available
        </span>
      </div>

      {/* Middle Row: Metric Pills */}
      <div className="my-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100/80 px-2.5 py-1 text-xs font-medium text-gray-700">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
          </svg>
          {recordCount} {recordUnit}
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100/80 px-2.5 py-1 text-xs font-medium text-gray-700">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-500">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {qualityScore} quality
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100/80 px-2.5 py-1 text-xs font-medium text-gray-700">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          {fileFormat}
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100/80 px-2.5 py-1 text-xs font-medium text-gray-700">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {compliance}
        </span>
      </div>

      {/* Meta Row: Countries, Languages, Updated */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-b border-gray-100 py-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span>Countries:</span>
          <span className="font-medium text-gray-700">🇺🇸 🇮🇳 +5</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span>Languages:</span>
          <span className="font-medium text-gray-700">English, French, +2</span>
        </div>

        <div>
          <span>Updated:</span>
          <span className="ml-1 font-medium text-gray-700">30d ago</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handleUnsave}
          disabled={isPending}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-800 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-900">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
          {isPending ? 'Removing…' : 'Remove from wishlist'}
        </button>

        <Link
          href={`/datasets/${dataset.slug}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-600 px-4 py-2 text-xs font-semibold text-blue-600 transition-all hover:bg-blue-50"
        >
          View dataset
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
