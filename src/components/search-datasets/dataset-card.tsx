// components/datasets/dataset-card.tsx
// One dataset result card in the explore grid — matches the Figma card:
// icon + title/code + "Sample available" pill, a row of stat chips, the
// countries/languages/updated meta line, and the Save / View dataset actions.
import Link from 'next/link'
import type { DatasetCard as DatasetCardData } from '@/types/dataset'
import { formatCompactNumber, formatRelativeTime, countryFlag } from '@/utils/format'
import { SaveButton } from '@/components/ui/save-button'

const MAX_VISIBLE_COUNTRIES = 3
const MAX_VISIBLE_LANGUAGES = 2

function StatChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 font-public-sans text-xs font-medium text-[#475569]">
      {icon}
      {label}
    </span>
  )
}

const ICONS = {
  records: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15 9l3 1.5v3L15 15" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  quality: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6-4.5-4.1 6-.7L12 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  format: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  compliance: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.5-3 8.2-7 9.5-4-1.3-7-5-7-9.5V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chevron: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  cardMark: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="15" height="12" rx="2" stroke="white" strokeWidth="1.6" />
      <path d="M17 10l5-2.5v9L17 14" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
}

interface DatasetCardProps {
  dataset: DatasetCardData
  isLoggedIn?: boolean
  isSaved?: boolean
}

export function DatasetCard({ dataset, isLoggedIn = false, isSaved = false }: DatasetCardProps) {
  const {
    title,
    slug,
    datasetCode,
    industry,
    qualityScore,
    fileFormat,
    recordCount,
    recordUnit,
    compliance,
    languages,
    countries,
    sampleAvailable,
    updatedAt,
  } = dataset

  const extraCountries = Math.max(countries.length - MAX_VISIBLE_COUNTRIES, 0)
  const extraLanguages = Math.max(languages.length - MAX_VISIBLE_LANGUAGES, 0)

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#CBD5E1] hover:shadow-md">
      {/* Frame 1: Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F1B3D] text-white shadow-sm">
            {ICONS.cardMark}
          </span>
          <div>
            <h3 className="font-public-sans text-base font-semibold leading-snug text-[#181818] line-clamp-1">{title}</h3>
            <p className="mt-0.5 font-public-sans text-xs font-medium text-[#64748B]">
              {datasetCode ?? '—'}
              {industry && ` • ${industry}`}
            </p>
          </div>
        </div>
        {sampleAvailable && (
          <span className="shrink-0 rounded-full border border-[#BBF7D0] bg-[#DCFCE7] px-2.5 py-0.5 font-public-sans text-xs font-semibold text-[#15803D]">
            Sample available
          </span>
        )}
      </div>

      {/* Frame 2: Stat Chips with middle line separator */}
      <div className="my-3 border-t border-[#F1F5F9] pt-3.5">
        <div className="flex flex-wrap gap-2">
          {recordCount !== null && (
            <StatChip
              icon={ICONS.records}
              label={`${formatCompactNumber(recordCount)} ${recordUnit ?? 'records'}`}
            />
          )}
          {qualityScore !== null && (
            <StatChip icon={ICONS.quality} label={`${qualityScore.toFixed(1)} quality`} />
          )}
          {fileFormat && <StatChip icon={ICONS.format} label={`${fileFormat} format`} />}
          {compliance[0] && <StatChip icon={ICONS.compliance} label={compliance[0]} />}
        </div>
      </div>

      {/* Frame 3: Metadata with middle line separator */}
      <div className="mt-auto border-t border-[#F1F5F9] pt-3.5 font-public-sans text-xs text-[#64748B]">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
          {countries.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span>Countries:</span>
              <div className="flex items-center">
                <div className="flex -space-x-1.5">
                  {countries.slice(0, MAX_VISIBLE_COUNTRIES).map((c, i) => (
                    <span 
                      key={i}
                      className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white text-[14px] ring-2 ring-white"
                    >
                      {countryFlag(c)}
                    </span>
                  ))}
                </div>
                {extraCountries > 0 && (
                  <span className="ml-1 font-semibold text-[#1E293B]">+{extraCountries}</span>
                )}
              </div>
            </div>
          )}
          {languages.length > 0 && (
            <div className="flex items-center gap-1">
              <span>Languages:</span>
              <span className="font-semibold text-[#1E293B]">
                {languages.slice(0, MAX_VISIBLE_LANGUAGES).join(', ')}
                {extraLanguages > 0 && `, +${extraLanguages}`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span>Updated:</span>
            <span className="font-semibold text-[#1E293B]">{formatRelativeTime(updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Frame 4: Actions with middle line separator */}
      <div className="mt-3.5 flex items-center justify-between border-t border-[#F1F5F9] pt-3.5">
        <SaveButton
          datasetId={dataset.id}
          initialSaved={isSaved}
          isLoggedIn={isLoggedIn}
          variant="light"
        />
        <Link
          href={`/datasets/${slug}`}
          className="flex items-center gap-1.5 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-2 font-public-sans text-sm font-semibold text-[#2563EB] transition-all hover:bg-[#2563EB] hover:text-white"
        >
          View dataset
          {ICONS.chevron}
        </Link>
      </div>
    </div>
  )
}
