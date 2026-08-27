// components/landing/hero.tsx
// Landing hero: headline, supporting copy, and the two primary CTAs, centered
// over the decorative ribbon line-art in the top-left and bottom-right corners.

import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative flex min-h-[736px] items-center justify-center overflow-hidden bg-white px-6">
      {/* Decorative ribbons (transparent PNGs in /public/hero) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero/wave-left.png"
        alt=""
        aria-hidden="true"
        className="
    pointer-events-none
    absolute
    -top-14
    -left-0
    w-[660px]
    max-w-none
    select-none
  "
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero/wave-right.png"
        alt=""
        aria-hidden="true"
        className="
    absolute
    -bottom-14
    -right-15
    w-[650px]
    max-w-none
    pointer-events-none
    select-none
  "
      />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-[840px] flex-col items-center gap-12 text-center">
        <div className="flex flex-col items-center gap-6">
          <h1 className="font-public-sans text-4xl sm:text-5xl md:text-[64px] font-bold leading-tight md:leading-[78px] tracking-tight text-[#181818]">
            Discover High-Quality{' '}
            <br className="hidden sm:inline" />
            <span className="text-[#2563EB]">AI Training data</span> at scale
          </h1>
          <p className="max-w-[760px] font-public-sans text-lg md:text-xl font-normal leading-relaxed text-[#475569]">
            Access curated datasets across text, image, audio, video, RLHF, and
            annotation-ready formats built for teams shipping AI at production
            speed.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link
            href="/datasets"
            className="rounded-xl bg-[#2563EB] px-8 py-4 font-public-sans text-base font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-all hover:bg-[#1D4ED8] hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] active:scale-[0.98]"
          >
            Explore marketplace
          </Link>
          <Link
            href="/meet"
            className="rounded-xl border border-[#CBD5E1] bg-white px-8 py-4 font-public-sans text-base font-semibold text-[#2563EB] shadow-sm transition-all hover:border-[#2563EB] hover:bg-[#EFF6FF] active:scale-[0.98]"
          >
            Schedule a Call
          </Link>
        </div>
      </div>
    </section>
  )
}
