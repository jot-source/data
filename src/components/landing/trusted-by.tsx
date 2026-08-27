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
    <section className="border-y-[0.5px] border-[#DDDDDD] bg-white px-[120px] pb-12 pt-8">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-12">
        <h2 className="font-public-sans text-2xl font-semibold text-[#8C8C8C]">
          Trusted by leading AI companies
        </h2>

        <div className="flex w-full items-center justify-between">
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
