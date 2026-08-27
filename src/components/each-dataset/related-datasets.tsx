import React from 'react'
import { DatasetCard } from '@/components/search-datasets/dataset-card'
import type { DatasetCard as DatasetCardType } from '@/types/dataset'

export function RelatedDatasets({ datasets }: { datasets: DatasetCardType[] }) {
  if (!datasets || datasets.length === 0) return null

  return (
    <div className="mt-4">
      <h2 className="mb-6 text-lg font-semibold text-[#181818]">Related datasets</h2>
      <div className="grid gap-6 grid-cols-2">
        {datasets.slice(0, 4).map((dataset) => (
          <DatasetCard key={dataset.id} dataset={dataset} />
        ))}
      </div>
    </div>
  )
}
