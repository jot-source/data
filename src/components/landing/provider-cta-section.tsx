'use client'

import { useAuthModal } from '@/stores/auth-modal.store'

/*
  Provider CTA banner — Figma spec:
  - Banner: 1200x304, radius 20,
    gradient: 90deg #2749B8 0% → #3A6BF0 50% → #5C8CF7 100%
  - Ellipse 1: 430x430 @ left 871 / top -169, rgba(255,255,255,0.10)
  - Ellipse 2: 348x348 @ left 789 / top 172, rgba(255,255,255,0.08)
  - Content: left/top 48, width 672, 20px gap (12px between title and copy)
  - Tag: padding 8px 24px, bg rgba(255,255,255,0.14), radius 24,
      Public Sans 600 18/28 #DCE6FF
  - Title: Public Sans 600 48/64 #FFFFFF
  - Copy: Public Sans 600 20/28 #DCE6FF
  - Button: 148x56, padding 16px 32px, bg #E9F0FD, radius 10,
      drop-shadow 0 4px 4px rgba(0,0,0,0.12), Public Sans 600 16/24 #2565EB,
      left 976, vertically centered
*/

export function ProviderCtaSection() {
  const openAuth = useAuthModal((s) => s.open)

  return (
    <section className="w-full max-w-[100vw] overflow-x-hidden bg-white py-8 md:py-24">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-5">

        {/* Banner */}
        <div
          className="relative overflow-hidden rounded-xl md:rounded-[20px] p-4 sm:p-10 lg:p-12 min-h-[170px] md:min-h-[304px] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-8"
          style={{
            background:
              'linear-gradient(90deg, #2749B8 0%, #3A6BF0 50%, #5C8CF7 100%)',
          }}
        >
          {/* Ellipse 10 — top right */}
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              width: 430,
              height: 430,
              right: -100,
              top: -169,
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          {/* Ellipse 10 — bottom right */}
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              width: 348,
              height: 348,
              right: -50,
              top: 172,
              background: 'rgba(255, 255, 255, 0.08)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex w-full max-w-[680px] flex-col items-start gap-2.5 sm:gap-5">
            {/* Tag */}
            <div className="inline-flex items-center justify-center rounded-full bg-white/[0.14] px-3 sm:px-5 py-0.5 sm:py-1.5 font-public-sans text-[12px] sm:text-base font-semibold text-[#DCE6FF]">
              Data provider
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-3">
              {/* Title */}
              <h2 className="font-public-sans text-[16px] sm:text-4xl lg:text-5xl font-medium sm:font-semibold leading-tight text-white">
                Become a data provider
              </h2>

              {/* Description */}
              <p className="font-public-sans text-[10px] sm:text-lg lg:text-xl font-normal sm:font-medium leading-relaxed text-[#DCE6FF] max-w-[640px]">
                List your datasets on our platform, reach thousands of teams
                searching for data, and earn from every download.
              </p>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => openAuth('sign-up')}
            className="relative z-10 shrink-0 inline-flex h-11 sm:h-14 w-[120px] sm:w-auto sm:min-w-[148px] items-center justify-center rounded-lg sm:rounded-xl bg-[#F1F5F9] sm:bg-[#E9F0FD] px-4 sm:px-8 font-public-sans text-xs sm:text-base font-semibold text-[#181818] sm:text-[#2565EB] shadow-md transition-transform hover:scale-105 active:scale-95 focus:outline-none"
          >
            Join now
          </button>
        </div>

      </div>
    </section>
  )
}