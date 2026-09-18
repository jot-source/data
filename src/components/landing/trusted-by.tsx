// components/landing/trusted-by.tsx
// "Trusted by leading AI companies" — a bordered logo strip below the hero.
import type { ReactNode } from 'react'
import {
  SamsungMark,
  UberMark,
  OpenAIMark,
  ClaudeMark,
  FireworksMark,
} from './brand-marks'

interface Brand {
  id: string
  label: string
  mark: ReactNode
}

const BRANDS: Brand[] = [
  { id: 'samsung-1', label: 'Samsung', mark: <SamsungMark /> },
  { id: 'uber-1', label: 'Uber', mark: <UberMark /> },
  { id: 'openai', label: 'Open AI', mark: <OpenAIMark /> },
  { id: 'claude', label: 'Claude AI', mark: <ClaudeMark /> },
  { id: 'fireworks', label: 'Black fireworks', mark: <FireworksMark /> },
  { id: 'uber-2', label: 'Uber', mark: <UberMark /> },
  { id: 'samsung-2', label: 'Samsung', mark: <SamsungMark /> },
]

export function TrustedBy() {
  return (
    <section className="w-full max-w-[100vw] border-y-[0.5px] border-[#DDDDDD] bg-white px-4 py-8 sm:px-8 lg:px-[120px] lg:pb-12">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-8 md:gap-12">
        <h2 className="text-center font-public-sans text-xl sm:text-2xl font-semibold text-[#8C8C8C]">
          Trusted by leading AI companies
        </h2>

        {/* Mobile View: Marquee Scroll */}
        <div className="relative w-full overflow-hidden sm:hidden">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 20s linear infinite;
              display: flex;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}} />
          
          {/* Gradient Masks for smooth fade on edges */}
          <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee w-max items-center gap-8 px-4">
            {[...BRANDS, ...BRANDS].map((brand, i) => (
              <div key={`${brand.id}-${i}`} className="flex w-[64px] flex-col items-center gap-1.5 shrink-0">
                <div className="flex h-[32px] items-center justify-center">
                  {brand.mark}
                </div>
                <span className="font-public-sans text-[10px] leading-tight text-[#616161]">
                  {brand.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop View: Static Grid */}
        <div className="hidden sm:flex w-full flex-wrap items-center justify-center gap-8 md:justify-between">
          {BRANDS.map((brand) => (
            <div key={brand.id} className="flex w-[106px] flex-col items-center gap-2">
              <div className="flex h-[53px] items-center justify-center">
                {brand.mark}
              </div>
              <span className="font-public-sans text-[10px] leading-4 text-[#616161]">
                {brand.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
