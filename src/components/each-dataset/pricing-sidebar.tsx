'use client'

import { useDatasetActions } from '@/hooks/use-dataset-actions'
import type { DatasetDetail } from '@/types/dataset'

export function PricingSidebar({
  dataset,
  isLoggedIn = false,
  owned = false,
}: {
  dataset: DatasetDetail
  isLoggedIn?: boolean
  owned?: boolean
}) {
  const price = dataset.price ? Number(dataset.price) : 0
  const hasSample = Boolean(dataset.sampleUrl)

  const { promptSignIn, downloadSample, downloadDataset, buy, buying, buyError } =
    useDatasetActions(dataset.id, isLoggedIn)

  return (
    <div className="sticky top-4 w-full">
      <div className="flex flex-col gap-6 rounded-xl border border-[#CBD5E1] bg-white p-6">
        {/* Title */}
        <div>
          <div className="mb-1 text-xs text-[#8C8C8C]">
            {dataset.datasetCode ? `${dataset.datasetCode} / ` : ''}{dataset.industry || dataset.category || ''}
          </div>
          <h3 className="text-base font-semibold text-[#181818]">{dataset.title}</h3>
        </div>

        {/* Price — one-time purchase (installments coming later). Gated behind
            auth: logged-out viewers see a blurred placeholder + sign-in prompt,
            and the real number never reaches the client. */}
        <div className="rounded-xl border border-[#CBD5E1] bg-[#EFF6FF] px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#616161]">Pay in full</span>
            <span className="rounded-full bg-[#DBEAFE] px-2 py-0.5 text-[11px] font-medium text-[#2563EB]">
              One-time
            </span>
          </div>
          {isLoggedIn ? (
            <span className="mt-1.5 block text-2xl font-bold text-[#181818]">${price.toLocaleString()}</span>
          ) : (
            <button
              onClick={promptSignIn}
              className="mt-1.5 flex items-center gap-2 text-left"
              title="Sign in to view price"
            >
              <span className="select-none text-2xl font-bold text-[#181818] blur-[6px]">$8,888</span>
              <span className="text-xs font-medium text-[#2563EB] hover:underline">Sign in to view price</span>
            </button>
          )}
          <span className="mt-0.5 block text-[11px] text-[#8C8C8C]">Full dataset · one-time purchase</span>
        </div>

        {/* Feature List */}
        <ul className="flex flex-col gap-3">
          {[
            `Full ${dataset.recordCount ? formatCount(Number(dataset.recordCount)) : '1.8M'}-${dataset.recordUnit || 'scan'} dataset`,
            'Commercial license',
            'Secure portal download',
            'Lifetime access, no expiry',
            '12 months of free updates',
          ].map((feature, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-[#181818]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M3 8l3.5 3.5L13 5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        {/* Primary CTA — Download when owned, otherwise Buy */}
        {owned ? (
          <button
            onClick={downloadDataset}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#22C55E] px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#16A34A]"
          >
            <DownloadIcon />
            Download dataset
          </button>
        ) : (
          <button
            onClick={buy}
            disabled={buying}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#2563EB] px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
          >
            <CartIcon />
            {buying ? 'Redirecting…' : isLoggedIn ? `Buy now at $${price.toLocaleString()}` : 'Sign in to buy'}
          </button>
        )}

        {buyError && <p className="-mt-3 text-sm text-red-500">{buyError.message}</p>}

        {/* Links */}
        <div className="flex items-center justify-between">
          {hasSample ? (
            <button onClick={downloadSample} className="text-xs text-[#2563EB] hover:underline">
              Download sample first
            </button>
          ) : (
            <span className="text-xs text-[#8C8C8C]">No sample</span>
          )}
          <a href="#" className="text-xs text-[#2563EB] hover:underline">Refund policy</a>
          <a href="#" className="text-xs text-[#2563EB] hover:underline">Data licensing terms</a>
        </div>
      </div>
    </div>
  )
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString()
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 1h2l1.5 8h8L14 4H4"></path>
      <circle cx="6" cy="13" r="1"></circle>
      <circle cx="12" cy="13" r="1"></circle>
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10"></path>
    </svg>
  )
}
