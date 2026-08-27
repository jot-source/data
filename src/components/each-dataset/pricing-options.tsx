'use client'

import { useDatasetActions } from '@/hooks/use-dataset-actions'
import type { DatasetDetail } from '@/types/dataset'

export function PricingOptions({
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
    <div id="samples" className="scroll-mt-32 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-[#181818]">Try a sample before licensing.</h2>
        <p className="text-sm text-[#616161] leading-5">
          A test packet is a representative sample of the full dataset, allowing you to validate quality, compatibility, and fit before purchasing a license.
        </p>
      </div>

      {/* Free Sample Card */}
      <div className="rounded-2xl border border-[#CBD5E1] bg-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Left: Details */}
          <div className="flex-1 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-[#181818]">Free Sample</h3>
              <p className="text-sm text-[#616161]">
                Preview the dataset&apos;s structure, format, and annotation quality.
              </p>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm text-[#616161]">
              <li className="flex items-center gap-2"><DownloadIcon /> 1 download</li>
              <li className="flex items-center gap-2"><FolderIcon /> 50 mb</li>
              <li className="flex items-center gap-2"><BarIcon /> 5,000 records</li>
              <li className="flex items-center gap-2"><LockIcon /> 7 days access</li>
              <li className="flex items-center gap-2"><FileIcon /> CSV</li>
            </ul>
          </div>
          {/* Right: Price + CTA */}
          <div className="flex flex-col items-start gap-4">
            <span className="text-3xl font-bold text-[#181818]">Free</span>
            <p className="text-sm text-[#616161]">Ideal for previewing the dataset and testing basic pipeline compatibility.</p>
            <button
              onClick={downloadSample}
              disabled={!hasSample}
              className="rounded-lg bg-[#22C55E] px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16A34A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {hasSample ? 'Download sample' : 'No sample available'}
            </button>
          </div>
        </div>
      </div>

      {/* Enterprise Test Packet Card */}
      <div className="rounded-2xl border border-[#CBD5E1] bg-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Left: Details */}
          <div className="flex-1 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-[#181818]">Enterprise test packet</h3>
              <p className="text-sm text-[#616161]">
                Validate the full dataset with a larger, production-ready sample before licensing.
              </p>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm text-[#616161]">
              <li className="flex items-center gap-2"><DownloadIcon /> 3 download</li>
              <li className="flex items-center gap-2"><FolderIcon /> 500 mb</li>
              <li className="flex items-center gap-2"><BarIcon /> 2,50,000 records</li>
              <li className="flex items-center gap-2"><LockIcon /> 90 days access</li>
              <li className="flex items-center gap-2"><FileIcon /> CSV, JSON, Parquet</li>
            </ul>
          </div>
          {/* Right: Price + CTA */}
          <div className="flex flex-col items-start gap-4">
            {isLoggedIn ? (
              <span className="text-3xl font-bold text-[#181818]">${price}</span>
            ) : (
              <button onClick={promptSignIn} className="flex items-center gap-2" title="Sign in to view price">
                <span className="select-none text-3xl font-bold text-[#181818] blur-[6px]">$888</span>
                <span className="text-xs font-medium text-[#2563EB] hover:underline">Sign in to view price</span>
              </button>
            )}
            <p className="text-sm text-[#616161]">Ideal for previewing the dataset and testing basic pipeline compatibility.</p>
            {owned ? (
              <button
                onClick={downloadDataset}
                className="rounded-lg bg-[#22C55E] px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16A34A]"
              >
                Download dataset
              </button>
            ) : (
              <button
                onClick={buy}
                disabled={buying}
                className="rounded-lg bg-[#2563EB] px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
              >
                {buying ? 'Redirecting…' : isLoggedIn ? 'Buy now' : 'Sign in to buy'}
              </button>
            )}
            {buyError && <p className="text-sm text-red-500">{buyError.message}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#616161" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10"></path>
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#616161" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4.5V12a1.5 1.5 0 001.5 1.5h9A1.5 1.5 0 0014 12V6.5A1.5 1.5 0 0012.5 5H8L6.5 3H3.5A1.5 1.5 0 002 4.5z"></path>
    </svg>
  )
}

function BarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#616161" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="8" width="3" height="6" rx="0.5"></rect>
      <rect x="6.5" y="5" width="3" height="9" rx="0.5"></rect>
      <rect x="11" y="2" width="3" height="12" rx="0.5"></rect>
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#616161" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="10" height="7" rx="1.5"></rect>
      <path d="M5 7V5a3 3 0 016 0v2"></path>
    </svg>
  )
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#616161" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2h5l4 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z"></path>
      <path d="M9 2v4h4"></path>
    </svg>
  )
}
