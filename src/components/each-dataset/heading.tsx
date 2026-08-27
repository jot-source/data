import type { DatasetDetail } from '@/types/dataset'
import { SaveButton } from '@/components/ui/save-button'

function formatCount(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString()
}

interface DatasetHeadingProps {
  dataset: DatasetDetail
  isLoggedIn?: boolean
  isSaved?: boolean
}

export function DatasetHeading({ dataset, isLoggedIn = false, isSaved = false }: DatasetHeadingProps) {
  const pills = [
    dataset.recordCount ? { value: formatCount(Number(dataset.recordCount)), label: dataset.recordUnit || 'Records' } : null,
    dataset.fileSizeBytes ? { value: `${(Number(dataset.fileSizeBytes) / (1024 ** 4)).toFixed(1)} TB`, label: 'storage' } : null,
    dataset.languages?.length ? { value: String(dataset.languages.length), label: 'languages' } : null,
    dataset.countries?.length ? { value: String(dataset.countries.length), label: 'countries' } : null,
  ].filter(Boolean) as { value: string; label: string }[]

  return (
    <div className="rounded-2xl bg-[#0D1B2A] p-5 text-white">
      <div className="flex flex-col gap-3">
        {/* Top row: Badge + Save */}
        <div className="flex w-full items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#0D303B] px-4 py-2 text-xs font-medium text-[#7EE0D6]">
            {dataset.datasetCode && <><span>{dataset.datasetCode}</span><span className="mx-1 inline-block h-1 w-1 rounded-full bg-[#7EE0D6]"></span></>}
            <span>{dataset.industry || dataset.category || 'General'}</span>
          </span>
          <SaveButton
            datasetId={dataset.id}
            initialSaved={isSaved}
            isLoggedIn={isLoggedIn}
            variant="dark"
          />
        </div>

        {/* Title + Description */}
        <h1 className="text-xl font-semibold leading-7 mt-1">{dataset.title}</h1>
        <p className="text-xs font-medium leading-4 text-[#D3E0FB]">
          {dataset.description}
        </p>

        {/* Metric Pills */}
        {pills.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-3">
            {pills.map((pill, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-[#1B2837] px-4 py-2 text-xs">
                <span className="font-medium text-white">{pill.value}</span>
                <span className="text-[#CCCCCC]">{pill.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
