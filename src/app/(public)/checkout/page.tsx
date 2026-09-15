'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCartStore } from '@/stores/cart.store'

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const calculatedTotal = totalPrice()
  const displayTotal = calculatedTotal.toLocaleString()

  const handlePay = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setIsCompleted(true)
      clearCart()
    }, 1500)
  }

  if (isCompleted) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] py-16 text-[#181818] font-public-sans flex items-center justify-center">
        <div className="mx-auto w-full max-w-md px-4 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Order Placed Successfully!</h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Thank you for your purchase. Your dataset download links and purchase agreement have been sent to your email.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/profile"
              className="w-full rounded-xl bg-[#2563EB] py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1d4ed8]"
            >
              View My Datasets
            </Link>
            <Link
              href="/datasets"
              className="w-full rounded-xl border border-[#CBD5E1] bg-white py-3 text-sm font-semibold text-[#475569] transition-all hover:bg-slate-50"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 text-[#181818] font-public-sans">
      <div className="mx-auto w-full max-w-[900px] px-4 sm:px-5">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/cart" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#64748B] hover:text-[#2563EB] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Cart
          </Link>
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Secure Checkout</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Order Details */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#0F172A] mb-4">Order Summary</h2>
            <div className="flex flex-col gap-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs py-2 border-b border-slate-100">
                  <div>
                    <p className="font-semibold text-[#0F172A]">{item.title}</p>
                    <p className="text-[#64748B] text-[11px]">{item.badge}</p>
                  </div>
                  <span className="font-bold text-[#0F172A]">${item.price.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-sm font-bold pt-2 text-[#0F172A]">
              <span>Total Amount</span>
              <span className="text-lg text-[#2563EB]">${displayTotal}</span>
            </div>
          </div>

          {/* Payment Card Form */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-[#0F172A]">Payment Information</h2>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#475569]">Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                defaultValue="John Doe"
                className="w-full rounded-xl border border-[#CBD5E1] px-3.5 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#475569]">Card Number</label>
              <input
                type="text"
                placeholder="•••• •••• •••• 4242"
                defaultValue="•••• •••• •••• 4242"
                className="w-full rounded-xl border border-[#CBD5E1] px-3.5 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#475569]">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  defaultValue="12/28"
                  className="w-full rounded-xl border border-[#CBD5E1] px-3.5 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#475569]">CVC / CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  defaultValue="123"
                  className="w-full rounded-xl border border-[#CBD5E1] px-3.5 py-2.5 text-sm focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#2563EB] py-3.5 font-public-sans text-base font-semibold text-white transition-all hover:bg-[#1d4ed8] active:scale-[0.99] shadow-md disabled:opacity-50"
            >
              {isProcessing ? 'Processing Payment...' : `Complete Purchase ($${displayTotal})`}
            </button>

            <p className="text-center text-xs text-[#94A3B8]">🔒 256-Bit SSL Encrypted & Secure Checkout</p>
          </div>
        </div>
      </div>
    </main>
  )
}
