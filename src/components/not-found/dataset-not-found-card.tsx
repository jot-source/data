'use client'

import Image from 'next/image'
import Link from 'next/link'

export function DatasetNotFoundCard() {
  return (
    <div className="mx-auto flex w-full max-w-[343px] sm:max-w-[1200px] flex-col items-center justify-center text-center font-public-sans py-4 sm:py-8 px-2 sm:px-8 gap-4 sm:gap-6">
      {/* 404 Image Graphic (Figma Mobile Spec: 316px x 177px) */}
      <div className="relative flex flex-col items-center justify-center">
        <Image
          src="/logo/ChatGPT Image Aug 4, 2026, 04_48_19 PM 1.png"
          alt="404 Page Not Found"
          width={316}
          height={177}
          priority
          className="h-[177px] w-[316px] sm:h-auto sm:w-60 object-contain"
        />
        <span className="mt-2 font-public-sans text-[10px] sm:text-[11px] font-bold tracking-widest text-[#2563EB] uppercase">
          PAGE NOT FOUND
        </span>
      </div>

      {/* Text Group */}
      <div className="flex w-full max-w-[343px] sm:max-w-2xl flex-col items-center justify-center gap-2 sm:gap-3 text-center">
        {/* Main Heading (Figma Mobile Spec: 343 Fill x 32 Hug, SemiBold 20px) */}
        <h2 className="w-full font-public-sans text-xl sm:text-3xl font-semibold text-[#2B2B2B] tracking-tight leading-snug">
          This dataset went missing
        </h2>

        {/* Description Paragraph (Figma Mobile Spec: 343 Fill x 60 Hug, Regular 14px) */}
        <p className="w-full font-public-sans text-xs sm:text-base text-[#616161] leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved. Return to the homepage to continue browsing.
        </p>
      </div>

      {/* Back to Home Button (Figma Mobile Spec: 343 Fill x 44 Hug full-width button) */}
      <Link
        href="/"
        className="inline-flex h-[44px] sm:h-10 w-full sm:w-auto max-w-[343px] items-center justify-center rounded-lg bg-[#2563EB] px-6 font-public-sans text-sm font-semibold text-white transition-all hover:bg-[#1d4ed8] active:scale-95 shadow-xs"
      >
        Back to home
      </Link>
    </div>
  )
}
