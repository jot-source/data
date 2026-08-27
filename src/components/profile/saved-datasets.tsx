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
    <div className="mt-12" id="wishlist-section">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">Wishlist</h2>
      <p className="mb-6 text-sm text-gray-500">Review and manage the datasets you&apos;ve saved</p>

      {datasets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white/50 p-12 text-center">
          <h3 className="mb-1 text-base font-semibold text-gray-900">No saved datasets yet</h3>
          <p className="mb-6 text-sm text-gray-500">Explore the marketplace to save datasets you&apos;re interested in.</p>
          
          <Link
            href="/datasets"
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Explore datasets
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {datasets.map((dataset) => (
            <SavedDatasetCard
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

function SavedDatasetCard({
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

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white/50 p-5 transition-all hover:shadow-sm">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F1B3D]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="6" width="15" height="12" rx="2" stroke="white" strokeWidth="1.6" />
            <path d="M17 10l5-2.5v9L17 14" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </span>

        <div>
          <h3 className="text-sm font-semibold text-gray-900">{dataset.title}</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {dataset.datasetCode ?? '—'}
            {dataset.industry && ` • ${dataset.industry}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleUnsave}
          disabled={isPending}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          {isPending ? 'Removing…' : 'Unsave'}
        </button>
        <Link
          href={`/datasets/${dataset.slug}`}
          className="rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
        >
          View dataset
        </Link>
      </div>
    </div>
  )
}
