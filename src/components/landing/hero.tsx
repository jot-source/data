// components/landing/hero.tsx
// Landing hero: headline, supporting copy, and the two primary CTAs, centered
// over the decorative ribbon line-art in the top-left and bottom-right corners.

import Link from 'next/link'

export function Hero() {
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
      <div className="relative z-10 flex w-full max-w-[840px] flex-col items-center gap-8 md:gap-12 text-center">
        <div className="flex w-full flex-col items-center gap-4 sm:gap-6">
          <h1 className="w-full font-public-sans text-3xl sm:text-5xl md:text-[64px] font-bold leading-tight md:leading-[78px] tracking-tight text-[#181818]">
            Discover High-Quality{' '}
            <br className="hidden sm:inline" />
            <span className="text-[#2563EB]">AI Training data</span> at scale
          </h1>
          <p className="w-full max-w-[760px] font-public-sans text-base sm:text-lg md:text-xl font-normal leading-relaxed text-[#475569] px-2">
            Access curated datasets across text, image, audio, video, RLHF, and
            annotation-ready formats built for teams shipping AI at production
            speed.
          </p>
        </div>

        {/* CTA Buttons — full width stacked on mobile, row on tablet/desktop */}
        <div className="flex w-full flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 px-2 sm:px-0">
          <Link
            href="/datasets"
            className="flex h-12 w-full sm:w-auto items-center justify-center rounded-xl bg-[#2563EB] px-8 font-public-sans text-base font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-all hover:bg-[#1D4ED8] hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] active:scale-[0.98]"
          >
            Explore marketplace
          </Link>
          <Link
            href="/meet"
            className="flex h-12 w-full sm:w-auto items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-8 font-public-sans text-base font-semibold text-[#2563EB] shadow-sm transition-all hover:border-[#2563EB] hover:bg-[#EFF6FF] active:scale-[0.98]"
          >
            Schedule a Call
          </Link>
        </div>
      </div>
    </section>
  )
}
