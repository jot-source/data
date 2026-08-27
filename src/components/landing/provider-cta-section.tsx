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
    <section className="w-full bg-white py-24">
      <div className="mx-auto max-w-[1200px] px-5">

        {/* Banner */}
        <div
          className="relative overflow-hidden"
          style={{
            minHeight: 304,
            borderRadius: 20,
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
              left: 871,
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
              left: 789,
              top: 172,
              background: 'rgba(255, 255, 255, 0.08)',
            }}
          />

          {/* Content */}
          <div
            className="relative z-10 flex flex-col items-start"
            style={{ padding: 48, gap: 20, maxWidth: 672 + 48 }}
          >
            {/* Tag */}
            <div
              className="inline-flex items-center justify-center"
              style={{
                padding: '8px 24px',
                background: 'rgba(255, 255, 255, 0.14)',
                borderRadius: 24,
                fontFamily: "'Public Sans', sans-serif",
                fontWeight: 600,
                fontSize: 18,
                lineHeight: '28px',
                color: '#DCE6FF',
              }}
            >
              Data provider
            </div>

            <div className="flex flex-col" style={{ gap: 12 }}>
              {/* Title */}
              <h2
                style={{
                  fontFamily: "'Public Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 48,
                  lineHeight: '64px',
                  color: '#FFFFFF',
                }}
              >
                Become a data provider
              </h2>

              {/* Description */}
              <p
                style={{
                  fontFamily: "'Public Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 20,
                  lineHeight: '28px',
                  color: '#DCE6FF',
                  maxWidth: 672,
                }}
              >
                List your datasets on our platform, reach thousands of teams
                searching for data, and earn from every download.
              </p>
            </div>

            {/* Button — in flow on mobile, pinned right-center on lg */}
            <button
              onClick={() => openAuth('sign-up')}
              className="inline-flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:outline-none lg:absolute lg:top-1/2 lg:-translate-y-1/2"
              style={{
                width: 148,
                height: 56,
                padding: '16px 32px',
                background: '#E9F0FD',
                borderRadius: 10,
                filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.12))',
                fontFamily: "'Public Sans', sans-serif",
                fontWeight: 600,
                fontSize: 16,
                lineHeight: '24px',
                color: '#2565EB',
                left: 976,
              }}
            >
              Join now
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}