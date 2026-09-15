'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart.store'
import { toggleSaveDataset } from '@/actions/saved-dataset.actions'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { items, wishlist, removeItem, toggleWishlist, totalPrice } = useCartStore()

  const [ndaState, setNdaState] = useState<'required' | 'pending' | 'signed'>('required')
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [itemToRemove, setItemToRemove] = useState<string | null>(null)

  const cycleNdaState = () => {
    if (ndaState === 'required') setNdaState('pending')
    else if (ndaState === 'pending') setNdaState('signed')
    else setNdaState('required')
  }

  const handleToggleWishlist = async (id: string) => {
    toggleWishlist(id)
    await toggleSaveDataset(id)
  }

  const calculatedTotal = mounted ? totalPrice() : 0
  const displayTotal = calculatedTotal.toLocaleString()
  const activeItems = mounted ? items : []

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 text-[#181818] font-public-sans">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-5">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 mb-6" />
          <div className="h-10 w-72 animate-pulse rounded-lg bg-slate-200 mb-8" />
          <div className="h-64 w-full animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-3 pb-28 sm:py-12 text-[#181818] font-public-sans">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-5">
        
        {/* Mobile-Only Cart Header Bar (Figma Mobile Spec: ← Cart + 🎧 Support Icon) */}
        <div className="flex sm:hidden items-center justify-between py-2 mb-4 border-b border-[#F1F5F9] pb-3">
          <div className="flex items-center gap-3">
            <Link
              href="/datasets"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#181818] hover:bg-[#F1F5F9] transition-colors"
              aria-label="Back to datasets"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </Link>
            <h1 className="font-public-sans text-base font-medium leading-[24px] text-[#2B2B2B]">
              Cart
            </h1>
          </div>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#475569] shadow-xs hover:bg-[#F8FAFC] transition-colors"
            aria-label="Support"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </button>
        </div>

        {/* Desktop-Only Breadcrumb Navigation */}
        <nav className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-[#64748B] mb-6">
          <Link href="/" className="hover:text-[#2563EB] transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <Link href="/datasets" className="hover:text-[#2563EB] transition-colors">
            Marketplace
          </Link>
          <span>&gt;</span>
          <span className="hover:text-[#2563EB] transition-colors cursor-pointer">
            Medical Imaging Annotation
          </span>
          <span>&gt;</span>
          <span className="font-semibold text-[#1E293B]">Cart</span>
        </nav>

        {/* Desktop-Only Page Title & Subtitle */}
        <div className="hidden sm:block mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#0F172A]">
            {activeItems.length} datasets · ${displayTotal}
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-[#64748B]">
            Review your datasets and continue to payment.
          </p>
        </div>

        {activeItems.length === 0 ? (
          /* Figma Spec Empty Cart State (Frame 1597881772: 343px Fill x 264px Hug on Mobile) */
          <div className="mx-auto flex w-full max-w-[343px] sm:max-w-[1200px] min-h-[264px] flex-col items-center justify-center gap-6 rounded-[16px] border border-[#CBD5E1] bg-white sm:bg-[#F8FAFC] px-5 py-8 text-center shadow-xs">
            {/* Top Light Blue Cart Icon Box */}
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DBEAFE]/60 text-[#2563EB] shadow-xs">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>

            {/* Text Copy Section (Frame 1597881724: 303px Fill x 72px Hug, 8px Gap) */}
            <div className="flex w-full max-w-[303px] flex-col items-center gap-2">
              <h3 className="font-public-sans text-base font-medium text-[#2B2B2B]">
                Your cart is empty
              </h3>
              <p className="font-public-sans text-sm font-normal text-[#616161] leading-relaxed">
                Browse the marketplace to find datasets for your AI project.
              </p>
            </div>

            {/* CTA Button (181px Fill x 40px Hug) */}
            <Link
              href="/datasets"
              className="inline-flex h-10 w-[181px] items-center justify-center rounded-xl bg-[#2563EB] px-[28px] py-[8px] font-public-sans text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#1d4ed8] active:scale-[0.99]"
            >
              Browse datasets
            </Link>
          </div>
        ) : (
          /* Main 2-Column Grid Layout (1200px max width, 32px gap) */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_438px] gap-8 items-start">
            
            {/* Left Column: Cart Dataset Cards */}
            <div className="flex flex-col gap-4">
              {items.map((item) => {
                const isWishlisted = wishlist.includes(item.id)
                return (
                  <div
                    key={item.id}
                    className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        {/* Icon Container */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F1B3D] text-white shadow-sm">
                          {item.iconType === 'video' ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="23 7 16 12 23 17 23 7" />
                              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                          ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          )}
                        </div>

                        {/* Title & Subtitle */}
                        <div>
                          <h3 className="font-public-sans text-base sm:text-lg font-semibold text-[#0F172A] leading-snug">
                            {item.title}
                          </h3>
                          <p className="mt-0.5 text-xs text-[#64748B]">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Pill Badge (Full dataset / Test packet) */}
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          item.badge === 'Full dataset'
                            ? 'border border-[#22C55E]/40 bg-[#F0FDF4] text-[#16A34A]'
                            : 'border border-[#9333EA]/40 bg-[#FAF5FF] text-[#7E22CE]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>

                    {/* Metadata Tags Row */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-[#475569]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M3 9h18" />
                          <path d="M9 21V9" />
                        </svg>
                        1.8M scans
                      </div>

                      <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-[#475569]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        9.2 quality
                      </div>

                      <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-[#475569]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        DICOM format
                      </div>

                      <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-[#475569]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        IRB-compliant
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-5 flex items-center justify-between border-t border-[#F1F5F9] pt-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setItemToRemove(item.id)}
                          className="font-public-sans text-sm font-normal text-[#A31A1A] transition-colors hover:text-[#7f1313] hover:underline"
                        >
                          Remove
                        </button>
                        <span className="text-slate-300 text-xs select-none">·</span>
                        <button
                          type="button"
                          onClick={() => handleToggleWishlist(item.id)}
                          className="font-public-sans text-sm font-normal text-[#2565EB] transition-colors hover:text-[#1d4ed8] hover:underline"
                        >
                          {isWishlisted ? 'Saved to wishlist' : 'Save to wishlist'}
                        </button>
                      </div>

                      <div className="font-public-sans text-2xl font-semibold leading-[32px] text-[#181818]">
                        ${item.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right Column: Mobile Cart Summary & Checkout Cards Section (Matching Figma Spec 1:1) */}
            <div className="flex flex-col gap-3.5 w-full">
              
              {/* 1. Price summary Card (Checkout card / Onetime - Figma: 343 Fill x 248 Hug, Radius 12px, Padding 16px, Gap 12px) */}
              <div className="rounded-xl border border-[#CBD5E1] bg-white p-4 shadow-2xs flex flex-col gap-3 font-public-sans">
                {/* Header */}
                <h3 className="text-base font-semibold text-[#181818]">
                  Price summary
                </h3>

                {/* Dataset Line Items */}
                <div className="flex flex-col gap-2.5 pt-1">
                  {items.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 truncate max-w-[240px]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#64748B] shrink-0">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span className="font-normal text-[#181818] truncate">{item.title}</span>
                      </div>
                      <span className="font-semibold text-[#181818] shrink-0">${item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Total Row (Total in #181818, $18,500 in vibrant Blue #2563EB) */}
                <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
                  <span className="text-sm font-semibold text-[#181818]">Total</span>
                  <span className="text-base font-semibold text-[#2563EB]">
                    ${displayTotal}
                  </span>
                </div>

                {/* Refund Policy Banner (Figma Spec: #FFF8EB light warm cream background with dotted policy link) */}
                <div className="rounded-lg bg-[#FFF8EB] px-3 py-2 text-left">
                  <button
                    type="button"
                    onClick={() => setShowPolicyModal(true)}
                    className="font-public-sans text-xs font-normal text-[#181818] underline decoration-dotted decoration-[#616161] hover:text-[#2563EB] transition-colors"
                  >
                    View cancellation and refund policy
                  </button>
                </div>
              </div>

              {/* 2. EMI Available Card (Figma Spec: 343 Fill x 44 Hug, Radius 8px, Text 14px Regular #2B2B2B, Line-height 20px) */}
              <div className="flex w-full items-center justify-between rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 shadow-2xs font-public-sans">
                <span className="font-public-sans text-sm font-normal text-[#2B2B2B] leading-[20px]">
                  EMI available · From $250/month
                </span>
                <button
                  type="button"
                  onClick={() => alert('EMI payments available with select credit cards. Pay in 3, 6, or 12 low monthly installments starting from $250/month.')}
                  aria-label="EMI Info"
                  className="text-[#64748B] hover:text-[#181818] transition-colors shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </button>
              </div>

              {/* 3. Mobile NDA Card Comp (Figma Spec: 343 Fill x 88/76/100 Hug - 3 Interactive States) */}
              <div
                onClick={cycleNdaState}
                className={`group relative flex items-center justify-between rounded-xl p-4 transition-all cursor-pointer font-public-sans ${
                  ndaState === 'signed'
                    ? 'border border-[#86EFAC] bg-[#E6F4EA]'
                    : ndaState === 'pending'
                    ? 'border border-[#FCD34D] bg-[#FFF8EB]'
                    : 'border border-[#CBD5E1] bg-white hover:border-[#2563EB]'
                }`}
                title="Click to toggle NDA status state (Required -> Pending -> Signed)"
              >
                <div className="flex items-start gap-3.5 pr-2">
                  {/* State Icon Badge */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      ndaState === 'signed'
                        ? 'bg-[#DCFCE7] border border-[#BBF7D0] text-[#16A34A]'
                        : ndaState === 'pending'
                        ? 'bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706]'
                        : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#2563EB]'
                    }`}
                  >
                    {ndaState === 'signed' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <polyline points="9 15 11 17 15 13" />
                      </svg>
                    ) : ndaState === 'pending' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <circle cx="12" cy="13" r="3" />
                        <polyline points="12 12 12 13 13 13" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    )}
                  </div>

                  {/* Title & Copy */}
                  <div>
                    <h4
                      className={`text-sm font-semibold ${
                        ndaState === 'signed'
                          ? 'text-[#15803D]'
                          : ndaState === 'pending'
                          ? 'text-[#B45309]'
                          : 'text-[#181818]'
                      }`}
                    >
                      {ndaState === 'signed'
                        ? 'Agreement signed'
                        : ndaState === 'pending'
                        ? 'Pending signature'
                        : 'Purchased agreement required'}
                    </h4>
                    <p
                      className={`mt-0.5 text-xs leading-relaxed max-w-[260px] ${
                        ndaState === 'signed'
                          ? 'text-[#166534]'
                          : ndaState === 'pending'
                          ? 'text-[#92400E]'
                          : 'text-[#616161]'
                      }`}
                    >
                      {ndaState === 'signed'
                        ? "You're all set; you can now purchase this dataset."
                        : ndaState === 'pending'
                        ? "Sent to madhu@macgence.com, expires in 4 hrs, we'll auto update this once it's signed"
                        : 'Read and send the agreement for signature before you can check out.'}
                    </p>
                  </div>
                </div>

                {/* Action Link: View > */}
                <div
                  className={`flex shrink-0 items-center gap-0.5 text-xs font-semibold ${
                    ndaState === 'signed'
                      ? 'text-[#16A34A]'
                      : ndaState === 'pending'
                      ? 'text-[#D97706]'
                      : 'text-[#2563EB]'
                  }`}
                >
                  <span>View</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              {/* Desktop-Only Purchase Button (Desktop view sync) */}
              <div className="hidden sm:block mt-2">
                <Link
                  href={ndaState === 'signed' ? '/checkout' : '#'}
                  onClick={(e) => {
                    if (ndaState !== 'signed') {
                      e.preventDefault()
                      cycleNdaState()
                    }
                  }}
                  className={`flex w-full items-center justify-center rounded-xl py-3.5 font-public-sans text-base font-semibold transition-all shadow-md ${
                    ndaState === 'signed'
                      ? 'bg-[#2563EB] text-white hover:bg-[#1d4ed8] active:scale-[0.99]'
                      : 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed hover:bg-[#E2E8F0]'
                  }`}
                >
                  {ndaState === 'signed' ? 'Purchase' : 'Purchase (Agreement required)'}
                </Link>
              </div>

            </div>

          </div>
        )}

        {/* Mobile Fixed Bottom Checkout Bar (Figma Frame 2147240760: 375px x 72px Fixed Bottom Bar) */}
        {activeItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-40 flex sm:hidden h-[72px] items-center justify-between bg-white px-4 py-3 border-t border-[#E2E8F0] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] font-public-sans">
            {/* Left side: Total price label & price value (Frame 1597881232) */}
            <div className="flex flex-col justify-center gap-[2px]">
              <span className="text-[12px] font-medium text-[#616161] leading-tight">
                Total price
              </span>
              <span className="text-[16px] font-semibold text-[#262626] leading-tight">
                ${displayTotal}
              </span>
            </div>

            {/* Right side: 170px Purchase Button (Frame 1597881787 - Active vs Disabled depending on NDA state) */}
            <Link
              href={ndaState === 'signed' ? '/checkout' : '#'}
              onClick={(e) => {
                if (ndaState !== 'signed') {
                  e.preventDefault()
                  cycleNdaState()
                }
              }}
              className={`inline-flex h-11 w-[170px] shrink-0 items-center justify-center rounded-xl font-public-sans text-sm font-semibold shadow-xs transition-all ${
                ndaState === 'signed'
                  ? 'bg-[#2563EB] text-white hover:bg-[#1d4ed8] active:scale-[0.99]'
                  : 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed'
              }`}
            >
              Purchase
            </Link>
          </div>
        )}

        {/* Policy Modal */}
        {showPolicyModal && typeof window !== 'undefined' && createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4 backdrop-blur-[2px] animate-in fade-in duration-150 font-public-sans"
            onClick={() => setShowPolicyModal(false)}
          >
            <div
              className="w-full sm:max-w-[480px] rounded-t-[16px] rounded-b-none sm:rounded-[16px] bg-white p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <h3 className="text-base sm:text-lg font-semibold text-[#181818]">
                  Cancellation & Refund Policy
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPolicyModal(false)}
                  className="rounded-lg p-1 text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-3 text-xs sm:text-sm text-[#475569] leading-relaxed max-h-[60vh] overflow-y-auto">
                <p>
                  <strong>Cancellation Policy:</strong> You may cancel your order at any point prior to digital delivery or completion of the signature requirement.
                </p>
                <p>
                  <strong>Refund Policy:</strong> Due to the proprietary nature of dataset samples and AI training assets, full dataset downloads are eligible for a 100% refund within 7 days if the delivered dataset fails to meet declared specifications.
                </p>
                <p>
                  <strong>Sample Packets:</strong> Test packets and sample dataset orders are non-refundable once downloaded.
                </p>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowPolicyModal(false)}
                  className="w-full flex h-11 items-center justify-center rounded-xl bg-[#2563EB] font-semibold text-sm text-white transition-colors hover:bg-[#1d4ed8]"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Remove Dataset Confirmation Modal */}
        {itemToRemove && typeof window !== 'undefined' && createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4 backdrop-blur-[2px] animate-in fade-in duration-150"
            onClick={() => setItemToRemove(null)}
          >
            <div
              className="w-full sm:max-w-[440px] rounded-t-[16px] rounded-b-none sm:rounded-[16px] bg-white p-4 sm:p-6 shadow-2xl animate-in slide-in-from-bottom duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-public-sans text-base sm:text-xl font-semibold text-[#181818] leading-tight">
                Remove dataset from cart?
              </h3>
              <p className="mt-2 font-public-sans text-xs sm:text-sm font-normal leading-relaxed text-[#616161]">
                Removing this dataset will also remove any associated selections. You can add it back anytime before checkout.
              </p>

              <div className="mt-5 sm:mt-8 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setItemToRemove(null)}
                  className="flex h-11 items-center justify-center rounded-xl bg-[#F3F4F6] font-public-sans text-sm font-semibold text-[#181818] transition-colors hover:bg-[#E5E7EB] active:scale-[0.99]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeItem(itemToRemove)
                    setItemToRemove(null)
                  }}
                  className="flex h-11 items-center justify-center rounded-xl bg-[#A51D24] font-public-sans text-sm font-semibold text-white transition-colors hover:bg-[#8B181E] active:scale-[0.99] shadow-xs"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      </div>
    </main>
  )
}
