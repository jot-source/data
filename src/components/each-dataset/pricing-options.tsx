'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/stores/cart.store'
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
  const router = useRouter()
  const price = 199
  const sampleDownloadUrl = dataset.sampleUrl || '/dummy-data/sample-dataset.csv'
  const hasSample = Boolean(sampleDownloadUrl)

  const [sampleStatus, setSampleStatus] = useState<'idle' | 'preparing' | 'failed'>('idle')
  const [isSlow, setIsSlow] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [clickHistory, setClickHistory] = useState<number[]>([])
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!showCartModal) return
    const timer = setTimeout(() => {
      setShowCartModal(false)
    }, 4000)
    return () => clearTimeout(timer)
  }, [showCartModal])

  const { promptSignIn, downloadDataset } =
    useDatasetActions(dataset.id, isLoggedIn)

  const { addItem, items } = useCartStore()
  const testPacketId = `${dataset.id}-test-packet`
  const isTestPacketInCart = items.some((item) => item.id === testPacketId)

  const handleAddToCartTestPacket = () => {
    if (!isLoggedIn) {
      promptSignIn()
      return
    }
    addItem({
      id: testPacketId,
      title: dataset.title || 'Medical Imaging Annotation',
      subtitle: 'Enterprise test packet · 250k records · CSV/JSON/Parquet',
      badge: 'Test packet',
      price: 199,
      tags: ['250k records', '500 mb', 'CSV, JSON, Parquet', '90 days access'],
      iconType: 'text',
    })
    setShowCartModal(true)
  }

  // Countdown timer for rate-limit cooldown
  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 1 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldownSeconds])

  const handleDownloadSample = async () => {
    if (!isLoggedIn) {
      promptSignIn()
      return
    }
    if (!hasSample) return
    if (cooldownSeconds > 0) return

    const now = Date.now()
    // Filter clicks within the last 60 seconds
    const recentClicks = clickHistory.filter((timestamp) => now - timestamp < 60000)

    if (recentClicks.length >= 5) {
      setCooldownSeconds(60)
      return
    }

    const updatedClicks = [...recentClicks, now]
    setClickHistory(updatedClicks)

    if (updatedClicks.length >= 5) {
      setCooldownSeconds(60)
    }

    setSampleStatus('preparing')
    setIsSlow(false)

    const slowTimer = setTimeout(() => {
      setIsSlow(true)
    }, 3000)

    try {
      let response = await fetch(`/api/v1/datasets/${dataset.id}/sample`)

      if (response.status === 401) {
        promptSignIn()
        setSampleStatus('idle')
        return
      }

      if (response.status === 429) {
        setCooldownSeconds(60)
        setSampleStatus('idle')
        return
      }

      // Fallback to local dummy sample data if dataset has no backend sample URL yet
      if (!response.ok) {
        response = await fetch('/dummy-data/sample-dataset.csv')
      }

      if (!response.ok) {
        throw new Error(`SRV-${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${dataset.title || dataset.slug || 'dataset'}-sample`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      setSampleStatus('idle')
    } catch {
      setSampleStatus('failed')
      setShowErrorModal(true)
    } finally {
      clearTimeout(slowTimer)
    }
  }

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
          <div className="flex flex-col items-start gap-4 min-w-[240px]">
            <span className="text-3xl font-bold text-[#181818]">Free</span>
            <p className="text-sm text-[#616161]">Ideal for previewing the dataset and testing basic pipeline compatibility.</p>
            
            <div className="flex flex-col items-start gap-2 w-full">
              <button
                onClick={handleDownloadSample}
                disabled={!hasSample || sampleStatus === 'preparing' || cooldownSeconds > 0}
                className={`w-full md:w-auto flex items-center justify-center gap-2 rounded-lg px-8 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.99] disabled:cursor-not-allowed ${
                  cooldownSeconds > 0
                    ? 'bg-[#94A3B8] opacity-90'
                    : 'bg-[#2563EB] hover:bg-[#1D4FD7] disabled:opacity-75'
                }`}
              >
                {cooldownSeconds > 0 ? (
                  <>
                    <ClockIcon />
                    <span>Please wait ({cooldownSeconds}s)</span>
                  </>
                ) : sampleStatus === 'preparing' ? (
                  <>
                    <SpinnerIcon />
                    <span>Preparing...</span>
                  </>
                ) : (
                  <>
                    <DownloadIconWhite />
                    <span>{hasSample ? 'Download sample' : 'No sample available'}</span>
                  </>
                )}
              </button>

              {/* Cooldown limit notice */}
              {cooldownSeconds > 0 && (
                <p className="text-xs text-[#DC2626] flex items-center gap-1.5 font-medium animate-in fade-in duration-150">
                  <WarningIcon />
                  <span>Download limit reached. Try again in {cooldownSeconds}s.</span>
                </p>
              )}

              {/* Help text when downloading takes time */}
              {sampleStatus === 'preparing' && isSlow && cooldownSeconds === 0 && (
                <p className="text-xs text-[#616161] flex items-center gap-1.5 animate-in fade-in duration-150">
                  <ClockIcon />
                  <span>This may take a moment</span>
                </p>
              )}

              {/* Error text if download failed */}
              {sampleStatus === 'failed' && cooldownSeconds === 0 && (
                <p className="text-xs text-[#DC2626] flex items-center gap-1.5 font-medium animate-in fade-in duration-150">
                  <WarningIcon />
                  <span>Download failed retry again</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Popup Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#CBD5E1] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowErrorModal(false)}
              className="absolute right-4 top-4 text-[#616161] hover:text-[#181818] transition-colors p-1"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="h-10 w-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-lg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold text-[#181818]">Something went wrong on our end</h3>
              <p className="text-sm text-[#616161]">We couldn&apos;t process your download.</p>
              <p className="text-xs text-[#888888] flex items-center gap-1 mt-1">
                <ClockIcon /> Error code SRV-503
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="mailto:support@macgence.com"
                className="flex-1 rounded-xl bg-[#F1F5F9] px-4 py-2.5 text-center text-sm font-semibold text-[#181818] hover:bg-[#E2E8F0] transition-colors"
              >
                Contact support
              </a>
              <button
                onClick={() => {
                  setShowErrorModal(false)
                  handleDownloadSample()
                }}
                className="flex-1 rounded-xl bg-[#2563EB] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#1D4FD7] transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

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
              <span className="text-3xl font-bold text-[#181818]">$199</span>
            ) : (
              <button onClick={promptSignIn} className="flex items-center gap-2" title="Sign in to view price">
                <span className="select-none text-3xl font-bold text-[#181818] blur-[6px]">$199</span>
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
                onClick={handleAddToCartTestPacket}
                className={`rounded-lg px-8 py-2.5 font-public-sans text-sm font-semibold text-white transition-all active:scale-[0.99] shadow-sm ${
                  isTestPacketInCart
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
                }`}
              >
                {isTestPacketInCart ? '✓ Added to cart' : 'Add to cart'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* "Added to cart" Figma Spec Floating Popup rendered via Portal directly on document.body */}
      {showCartModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden">
          {/* Dark Backdrop Dim Overlay Blur covering the ENTIRE window including sticky nav */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
            onClick={() => setShowCartModal(false)}
          />

          {/* Grid Container matching page 1200px layout anchoring popup at top right */}
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-5 relative z-[10000] pt-20 sm:pt-[92px] flex justify-end pointer-events-none">
            <div className="w-full max-w-[360px] rounded-2xl border border-[#CBD5E1] bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-5 text-[#181818] pointer-events-auto">
              {/* Header: Added to cart */}
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#22C55E] text-white">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h4 className="font-public-sans text-sm font-semibold text-[#181818]">
                  Added to cart
                </h4>
              </div>

              {/* Middle Item Box */}
              <div className="flex items-center gap-3 border-t border-[#F1F5F9] pt-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F1B3D] text-white shadow-xs">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-public-sans text-sm font-medium text-[#2B2B2B] truncate">
                    {dataset.title || 'Multilingual Chatbot Intent Corpus'}
                  </h5>
                  <p className="mt-0.5 font-public-sans text-xs text-[#64748B]">
                    $199
                  </p>
                </div>
              </div>

              {/* CTA Button: Go to cart */}
              <button
                onClick={() => {
                  setShowCartModal(false)
                  router.push('/cart')
                }}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-[#2563EB] font-public-sans text-sm font-semibold text-white transition-all hover:bg-[#1D4ED8] active:scale-[0.99] shadow-sm"
              >
                Go to cart
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}

function DownloadIconWhite() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10"></path>
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#616161" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6"></circle>
      <path d="M8 4.5V8l2.5 1.5"></path>
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L1.5 13h13L8 2z"></path>
      <path d="M8 6v3.5M8 11.5h.01"></path>
    </svg>
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

