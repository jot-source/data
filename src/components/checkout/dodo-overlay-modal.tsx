'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Script from 'next/script'

interface DodoOverlayModalProps {
  checkoutUrl: string | null
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess?: () => void
}

/**
 * Dodo Payments In-Page Overlay Modal
 * Renders an in-page popup modal directly over the cart page without leaving the website.
 */
export function DodoOverlayModal({
  checkoutUrl,
  isOpen,
  onClose,
  onPaymentSuccess,
}: DodoOverlayModalProps) {
  const [mounted, setMounted] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen && checkoutUrl) {
      setIframeError(false)
      setIframeLoading(true)

      // Try triggering DodoPayments SDK overlay if loaded in window
      if (typeof window !== 'undefined' && (window as unknown as { DodoPayments?: { openCheckout: (opts: { checkoutUrl: string }) => void } }).DodoPayments) {
        try {
          (window as unknown as { DodoPayments: { openCheckout: (opts: { checkoutUrl: string }) => void } }).DodoPayments.openCheckout({ checkoutUrl })
        } catch (e) {
          console.warn('DodoPayments SDK overlay trigger:', e)
        }
      }
    }
  }, [isOpen, checkoutUrl])

  const openPopupWindow = () => {
    if (!checkoutUrl) return
    const width = 640
    const height = 780
    const left = Math.max(0, Math.round((window.innerWidth - width) / 2 + window.screenX))
    const top = Math.max(0, Math.round((window.innerHeight - height) / 2 + window.screenY))

    window.open(
      checkoutUrl,
      'DodoCheckoutWindow',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    )
  }

  // Listen for postMessage from Dodo Payments checkout
  useEffect(() => {
    if (!isOpen) return

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'dodopayments:success' || event.data?.status === 'succeeded') {
        if (onPaymentSuccess) {
          onPaymentSuccess()
        }
      }
      if (event.data?.type === 'dodopayments:close' || event.data?.action === 'close') {
        onClose()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [isOpen, onClose, onPaymentSuccess])

  if (!isOpen || !checkoutUrl || !mounted) return null

  return createPortal(
    <>
      <Script src="https://js.dodopayments.com/v1/checkout.js" strategy="lazyOnload" />

      {/* In-Page Modal Overlay Backdrop */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-3 sm:p-5 backdrop-blur-sm animate-in fade-in duration-200 font-public-sans"
        onClick={onClose}
      >
        <div
          className="relative flex h-[88vh] max-h-[740px] w-full max-w-[540px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 border border-[#CBD5E1]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB] text-white font-bold text-xs shadow-xs">
                DP
              </div>
              <div>
                <h3 className="font-public-sans text-sm font-semibold text-[#0F172A] leading-tight">
                  Secure Checkout
                </h3>
                <p className="text-[11px] font-normal text-[#64748B]">
                  Powered by Dodo Payments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={openPopupWindow}
                className="flex items-center gap-1 text-[11px] font-medium text-[#2563EB] hover:bg-[#EFF6FF] px-2 py-1 rounded-md transition-colors"
                title="Open in Popup Window"
              >
                <span>Popup</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#E2E8F0] hover:text-[#0F172A]"
                aria-label="Close checkout modal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {iframeLoading && (
            <div className="absolute inset-0 top-14 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xs z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DBEAFE] text-[#2563EB]">
                <svg className="animate-spin h-6 w-6 text-[#2563EB]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="mt-3 font-public-sans text-sm font-medium text-[#1E293B]">
                Opening in-page payment modal...
              </p>
            </div>
          )}

          {/* In-Page Iframe Container */}
          {!iframeError ? (
            <div className="relative flex-1 w-full bg-white">
              <iframe
                src={checkoutUrl}
                className="h-full w-full border-0"
                allow="payment; autoplay; camera; microphone"
                onLoad={() => setIframeLoading(false)}
                onError={() => {
                  setIframeError(true)
                  setIframeLoading(false)
                }}
                title="Dodo Payments In-Page Checkout"
              />
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF3C7] text-[#D97706] mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-[#0F172A]">Complete Checkout</h4>
              <p className="mt-1 text-xs text-[#64748B] max-w-[320px]">
                Click below to complete your secure purchase in the pop-up window.
              </p>
              <button
                type="button"
                onClick={openPopupWindow}
                className="mt-4 flex h-10 px-5 items-center justify-center rounded-xl bg-[#2563EB] font-public-sans text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#1d4ed8]"
              >
                Launch Payment Window
              </button>
            </div>
          )}

          {/* Modal Footer Note */}
          <div className="flex h-12 shrink-0 items-center justify-between border-t border-[#F1F5F9] bg-[#F8FAFC] px-5 text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              256-bit SSL Encrypted & Tax Compliant
            </span>

            <button
              type="button"
              onClick={() => {
                if (onPaymentSuccess) {
                  onPaymentSuccess()
                } else {
                  window.location.href = '/checkout/success'
                }
              }}
              className="font-semibold text-[#2563EB] hover:underline"
            >
              Done Paying? View Receipt →
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
