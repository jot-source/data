'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/stores/cart.store'
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
  const router = useRouter()
  const price = dataset.price ? Number(dataset.price) : 7500
  const hasSample = Boolean(dataset.sampleUrl)

  const { promptSignIn, downloadSample, downloadDataset } =
    useDatasetActions(dataset.id, isLoggedIn)

  const { addItem, items } = useCartStore()
  const isInCart = items.some((item) => item.id === dataset.id)
  const [showCartModal, setShowCartModal] = useState(false)
  const [mounted, setMounted] = useState(false)

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

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      promptSignIn()
      return
    }
    addItem({
      id: dataset.id,
      title: dataset.title || 'Medical Imaging Annotation',
      subtitle: `${dataset.recordCount ? (Number(dataset.recordCount) / 1000000).toFixed(1) : '1.8'}M scans · DICOM/PNG · Full Dataset`,
      badge: 'Full dataset',
      price: price || 500,
      tags: ['1.8M scans', '9.2 quality', 'DICOM format', 'IRB-compliant'],
      iconType: 'medical',
    })
    setShowCartModal(true)
  }

  return (
    <div className="sticky top-4 w-full relative">
      <div className="flex flex-col gap-5 rounded-2xl border border-[#CBD5E1] bg-white p-6 shadow-sm">

        {/* Dataset Code & Category */}
        <div>
          <div className="text-xs font-medium text-[#8C8C8C] mb-1">
            {dataset.datasetCode || 'DS-1032'} / {dataset.industry || dataset.category || 'Healthcare'}
          </div>
          <h3 className="text-lg font-semibold text-[#181818] leading-snug">
            {dataset.title}
          </h3>
        </div>

        {/* Price & EMI */}
        <div>
          <div className="flex items-baseline gap-1.5">
            {isLoggedIn ? (
              <span className="text-3xl font-bold text-[#181818]">
                ${price.toLocaleString()}
              </span>
            ) : (
              <button
                onClick={promptSignIn}
                className="flex items-baseline gap-2 text-left"
                title="Sign in to view price"
              >
                <span className="select-none text-3xl font-bold text-[#181818] blur-[6px]">$7,500</span>
                <span className="text-xs font-medium text-[#2563EB] hover:underline">Sign in to view price</span>
              </button>
            )}
            <span className="text-sm font-normal text-[#64748B]">/Full payment</span>
          </div>

          <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-[#2563EB]">
            <span>EMI available · From $250 /month</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
        </div>

        {/* Feature Checkmarks List */}
        <ul className="flex flex-col gap-3 py-1">
          {[
            `Full ${dataset.recordCount ? (Number(dataset.recordCount) / 1000000).toFixed(1) : '1.8'}M-scan dataset`,
            'Commercial license',
            'Secure portal download',
            'Lifetime access, no expiry',
            'Delivered within 7 days of purchase.',
          ].map((feature, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-[#334155]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M3 8l3.5 3.5L13 5" stroke="#22C55E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        {/* Primary CTA — Add to cart / Download */}
        {owned ? (
          <button
            onClick={downloadDataset}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-4 font-public-sans text-sm font-semibold text-white transition-all hover:bg-[#16A34A] active:scale-[0.99]"
          >
            <DownloadIcon />
            Download dataset
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl font-public-sans text-sm font-semibold text-white transition-all active:scale-[0.99] shadow-sm ${
              isInCart
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
            }`}
          >
            {isInCart ? '✓ Added to cart' : 'Add to cart'}
          </button>
        )}

        {/* Links */}
        <div className="flex items-center justify-between text-xs pt-1">
          {hasSample ? (
            <button onClick={downloadSample} className="flex items-center gap-1 text-[#2563EB] hover:underline">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download sample
            </button>
          ) : (
            <span className="text-[#8C8C8C]">No sample</span>
          )}
          <a href="#" className="text-[#2563EB] hover:underline">Refund policy</a>
          <a href="#" className="text-[#2563EB] hover:underline">Data licensing terms</a>
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

          {/* Grid Container matching page 1200px layout anchoring popup at top right near pricing sidebar */}
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
                    {dataset.title || 'Medical Imaging Annotation'}
                  </h5>
                  <p className="mt-0.5 font-public-sans text-xs text-[#64748B]">
                    ${price.toLocaleString()}
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

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10"></path>
    </svg>
  )
}
