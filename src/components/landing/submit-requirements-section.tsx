'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const FEATURES = [
  'Any language, dialect, or regional variant',
  'Custom annotation schemas and taxonomies',
  'Volumes from thousands to hundreds of millions',
  'IRB and GDPR compliance support',
  'Dedicated project manager and QA lead',
]

export function SubmitRequirementsSection() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (res.ok) {
        setSuccess(true)
        e.currentTarget.reset()
        setTimeout(() => {
          router.push('/meet')
        }, 800)
      } else {
        alert('Failed to send request. Please try again later.')
      }
    } catch {
      alert('An error occurred while sending your request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="customize"
      className="w-full max-w-[100vw] overflow-x-hidden scroll-mt-4 text-white px-4 py-8 sm:px-6 sm:py-24"
      style={{
        background: 'radial-gradient(69.37% 177.6% at 50% 50%, #0F1427 57.35%, #36488D 100%)',
      }}
    >
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 sm:gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
        
        {/* Left Side: Copy & Checks */}
        <div className="flex w-full flex-1 flex-col pt-0 sm:pt-4 max-w-[520px]">
          {/* Mobile Heading (< sm) */}
          <h2 className="sm:hidden mb-2 font-public-sans text-[16px] font-semibold tracking-tight text-white leading-tight">
            Need custom data?
          </h2>

          {/* Desktop Heading (>= sm) */}
          <h2 
            className="hidden sm:block mb-6 sm:mb-8 font-public-sans text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.15]"
          >
            Need data that<br />doesn&apos;t exist yet?
          </h2>

          {/* Mobile Subtitle (< sm) */}
          <p className="sm:hidden mb-6 font-public-sans text-[12px] text-[#CCCCCC] leading-relaxed">
            From niche dialects to complex multi-modal annotations, we build custom datasets to power your proprietary models.
          </p>

          {/* Desktop Subtitle (>= sm) */}
          <p className="hidden sm:block mb-8 sm:mb-10 font-public-sans text-base sm:text-lg text-[#CBD5E1] leading-relaxed">
            From niche dialects to complex multi-modal annotations, we build custom datasets to power your proprietary models.
          </p>

          <div className="hidden sm:flex flex-col gap-4 sm:gap-5">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-3.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[#0F1427] shadow-sm">
                  <CheckIcon />
                </div>
                <span className="font-public-sans text-sm sm:text-lg font-medium text-white/95">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="w-full max-w-[343px] sm:max-w-[540px] rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-9 shadow-2xl border border-slate-100">
          <h3 className="mb-4 sm:mb-6 font-public-sans text-base sm:text-2xl font-bold tracking-tight text-[#181818]">
            Submit your requirements
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <label htmlFor="name" className="font-public-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#475569]">Full name</label>
              <input 
                id="name"
                name="name"
                required
                type="text" 
                placeholder="E.g. Nitish Reddy"
                className="h-10 sm:h-auto rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 sm:px-4 py-2 sm:py-3 font-public-sans text-xs sm:text-sm text-[#181818] outline-none placeholder:text-[#94A3B8] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <label htmlFor="email" className="font-public-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#475569]">Email</label>
              <input 
                id="email"
                name="email"
                required
                type="email" 
                placeholder="E.g. nitish@company.com"
                className="h-10 sm:h-auto rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 sm:px-4 py-2 sm:py-3 font-public-sans text-xs sm:text-sm text-[#181818] outline-none placeholder:text-[#94A3B8] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
              />
            </div>

            {/* Data Type */}
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <label htmlFor="dataType" className="font-public-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#475569]">Data Type</label>
              <div className="relative">
                <select 
                  id="dataType"
                  name="dataType"
                  required
                  className="h-10 sm:h-auto w-full appearance-none rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 sm:px-4 py-2 sm:py-3 font-public-sans text-xs sm:text-sm text-[#181818] outline-none focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
                  defaultValue=""
                >
                  <option value="" disabled className="text-gray-400">Select data type</option>
                  <option value="text">Text / NLP</option>
                  <option value="image">Image / Computer Vision</option>
                  <option value="audio">Audio / Speech</option>
                  <option value="video">Video</option>
                  <option value="other">Other / Multimodal</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                  <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                    <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <label htmlFor="description" className="font-public-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#475569]">Project Description</label>
              <textarea 
                id="description"
                name="description"
                required
                rows={3}
                placeholder="Describe the AI use case you are building and what data you need..."
                className="h-24 sm:h-auto sm:rows-3 resize-none rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 sm:px-4 py-2 sm:py-3 font-public-sans text-xs sm:text-sm text-[#181818] outline-none placeholder:text-[#94A3B8] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
              ></textarea>
            </div>

            {/* Estimated Budget */}
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <label htmlFor="budget" className="font-public-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#475569]">Estimated Budget</label>
              <div className="relative">
                <select 
                  id="budget"
                  name="budget"
                  required
                  className="h-10 sm:h-auto w-full appearance-none rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 sm:px-4 py-2 sm:py-3 font-public-sans text-xs sm:text-sm text-[#181818] outline-none focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
                  defaultValue=""
                >
                  <option value="" disabled className="text-gray-400">Select Budget range</option>
                  <option value="<5k">&lt; $5,000</option>
                  <option value="5k-25k">$5,000 - $25,000</option>
                  <option value="25k-100k">$25,000 - $100,000</option>
                  <option value="100k+">$100,000+</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                  <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                    <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-2 sm:mt-3 flex flex-col gap-2 sm:gap-3">
              <button 
                type="submit"
                disabled={loading}
                className="h-11 sm:h-auto w-full rounded-xl bg-[#2563EB] py-2.5 sm:py-3.5 font-public-sans text-sm sm:text-base font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-all hover:bg-[#1D4ED8] hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
              >
                {loading ? 'Submitting...' : 'Submit your requirements'}
              </button>
              
              {success && (
                <p className="text-center text-xs sm:text-sm font-medium text-green-600">Request submitted successfully!</p>
              )}
              
              <p className="text-center text-[10px] sm:text-xs text-[#64748B]">
                We respond within 1 business day. No commitment required.
              </p>
            </div>

          </form>
        </div>
      </div>
    </section>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
}
