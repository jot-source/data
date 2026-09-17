'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthModal } from '@/stores/auth-modal.store'

export function Hero() {
  const router = useRouter()
  const openAuthModal = useAuthModal((s) => s.open)
  const [supabase] = useState(() => createClient())
  const [user, setUser] = useState<unknown>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleScheduleCallClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const element = document.getElementById('customize')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push('/#customize')
    }
  }

  return (
    <section className="relative flex min-h-[560px] sm:min-h-[640px] md:min-h-[736px] w-full max-w-[100vw] flex-col items-center justify-center overflow-hidden bg-white px-4 py-14 sm:px-6 md:py-24">
      {/* Decorative ribbons (transparent PNGs in /public/hero) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero/wave-left.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 -left-8 w-[260px] sm:w-[440px] md:w-[660px] max-w-full select-none opacity-50 md:opacity-100"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero/wave-right.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 -right-8 w-[260px] sm:w-[440px] md:w-[650px] max-w-full select-none opacity-50 md:opacity-100"
      />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-[840px] flex-col items-center gap-6 sm:gap-8 md:gap-12 text-center px-1 sm:px-0">
        <div className="flex w-full flex-col items-center gap-3 sm:gap-6">
          <h1 className="w-full font-public-sans text-2xl sm:text-5xl md:text-[64px] font-semibold sm:font-bold leading-8 sm:leading-tight md:leading-[78px] tracking-tight text-[#181818]">
            Discover High-Quality{' '}
            <br className="hidden sm:inline" />
            <span className="font-medium text-[#2563EB]">AI Training data</span> at scale
          </h1>
          <p className="w-full max-w-[760px] font-public-sans text-xs sm:text-lg md:text-xl font-normal leading-4 sm:leading-relaxed text-[#444444] sm:text-[#475569] px-1 sm:px-2">
            Access curated datasets across text, image, audio, video, RLHF, and
            annotation-ready formats built for teams shipping AI at production
            speed.
          </p>
        </div>

        {/* CTA Buttons — 2-column side-by-side row on mobile per Figma (343px width), responsive on tablet/desktop */}
        <div className="flex w-full max-w-[343px] sm:max-w-none flex-row items-center justify-center gap-3 sm:gap-6">
          <a
            href="/meet"
            onClick={handleScheduleCallClick}
            className="flex h-11 sm:h-12 flex-1 sm:flex-initial sm:w-auto items-center justify-center rounded-[10px] sm:rounded-xl border border-[#DDDDDD] sm:border-[#CBD5E1] bg-white px-3 sm:px-8 font-public-sans text-sm sm:text-base font-semibold text-[#2565EB] sm:text-[#2563EB] shadow-sm transition-all hover:border-[#2563EB] hover:bg-[#EFF6FF] active:scale-[0.98] cursor-pointer whitespace-nowrap"
          >
            Schedule a Call
          </a>
          <Link
            href="/datasets"
            className="flex h-11 sm:h-12 flex-1 sm:flex-initial sm:w-auto items-center justify-center rounded-[10px] sm:rounded-xl bg-[#2563EB] px-3 sm:px-8 font-public-sans text-sm sm:text-base font-semibold text-white shadow-[2px_2px_4px_rgba(37,99,235,0.25)] sm:shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-all hover:bg-[#1D4ED8] hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] active:scale-[0.98] whitespace-nowrap"
          >
            Explore marketplace
          </Link>
        </div>
      </div>
    </section>
  )
}
