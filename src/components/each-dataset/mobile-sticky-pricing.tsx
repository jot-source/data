'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useCartStore } from '@/stores/cart.store'
import { useDatasetActions } from '@/hooks/use-dataset-actions'
import type { DatasetDetail } from '@/types/dataset'

export function MobileStickyPricing({
  dataset,
  isLoggedIn = false,
  owned = false,
}: {
  dataset: DatasetDetail
  isLoggedIn?: boolean
  owned?: boolean
}) {
  const price = dataset.price ? Number(dataset.price) : 7500
  const formattedPrice = price === 7500 ? '₹7,500' : `$${price}`
  
  const { promptSignIn, downloadDataset } = useDatasetActions(dataset.id, isLoggedIn)
  
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
      price,
      type: 'Full dataset',
      isEnterprise: false,
    })
    setShowCartModal(true)
  }

  // The sticky bar ONLY shows on mobile (lg:hidden) and sticks to the bottom
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col bg-white border-t border-[#E2E8F0] lg:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom)]">
        {/* Top section: EMI Info */}
        <div className="w-full bg-[#EFF6FF] px-4 py-2 border-b border-[#E2E8F0] flex items-center gap-1.5 font-public-sans text-[12px] font-normal text-[#616161]">
          <span>EMI available · From $250/month</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
        </div>
        
        {/* Bottom section: Price & CTA */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex flex-col gap-0.5 font-public-sans">
            <span className="text-[12px] font-medium text-[#595959]">Full payment</span>
            {isLoggedIn ? (
              <span className="text-[18px] font-semibold text-[#262626]">{formattedPrice}</span>
            ) : (
              <button onClick={promptSignIn} className="flex flex-col items-start gap-0 text-left" title="Sign in to view price">
                <span className="select-none text-[18px] font-semibold text-[#262626] blur-[4px]">{formattedPrice}</span>
              </button>
            )}
          </div>

          <div className="w-[170px] font-public-sans">
            {!isLoggedIn ? (
              <button
                onClick={promptSignIn}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] h-11 text-[14px] font-semibold text-white hover:bg-[#1D4ED8] transition-colors active:scale-[0.99] shadow-sm"
              >
                Sign in
              </button>
            ) : owned ? (
              <button
                onClick={downloadDataset}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#22C55E] h-11 text-[14px] font-semibold text-white hover:bg-[#16A34A] transition-colors shadow-sm"
              >
                Download
              </button>
            ) : isInCart ? (
              <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 h-11 text-[14px] font-semibold text-white cursor-default shadow-sm">
                ✓ Added to cart
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] h-11 text-[14px] font-semibold text-white hover:bg-[#1D4ED8] transition-colors active:scale-[0.99] shadow-sm"
              >
                Add to cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reused the same Added to Cart Portal from PricingSidebar */}
      {showCartModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden">
          {/* Dark Backdrop Dim Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
            onClick={() => setShowCartModal(false)}
          />
          {/* Grid Container */}
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-5 relative z-[10000] pt-20 flex justify-end pointer-events-none">
            <div className="w-full max-w-[360px] rounded-2xl border border-[#CBD5E1] bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-5 text-[#181818] pointer-events-auto">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#22C55E] text-white">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h4 className="font-public-sans text-sm font-semibold text-[#181818]">Added to cart</h4>
              </div>
              <div className="flex gap-4">
                <div className="h-16 w-16 shrink-0 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3 flex items-center justify-center text-[#2563EB]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <h5 className="font-public-sans text-sm font-semibold text-[#181818] line-clamp-1">{dataset.title}</h5>
                    <p className="mt-0.5 text-xs text-[#64748B]">Full dataset</p>
                  </div>
                  <div className="text-sm font-semibold text-[#181818]">{formattedPrice}</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  onClick={() => setShowCartModal(false)}
                  className="w-full rounded-xl bg-[#2563EB] py-2.5 text-center text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
                >
                  Continue shopping
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
