// components/auth/auth-side-panel.tsx
// Shared blue marketing panel on the left of every auth card (sign-in,
// sign-up, forgot-password). Hidden on small screens.
import Image from 'next/image'

const BULLETS = [
  'Download free samples',
  'Save datasets to your workspace',
  'Track purchases and downloads',
]

export function AuthSidePanel() {
  return (
    <div className="relative flex w-full shrink-0 flex-col overflow-hidden bg-[#1A2552] px-6 pt-6 pb-11 md:w-[333px] md:px-[27px] md:pb-[62px] md:pt-[29px]">
      {/* Decorative ellipses (#212C57) — mobile & desktop positions, clipped */}
      <span className="pointer-events-none absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-[#212C57] md:left-[-21px] md:top-[461px] md:h-[201px] md:w-[201px]" />
      <span className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#212C57] md:left-[266px] md:top-[-8px] md:h-[101px] md:w-[101px]" />

      {/* Logo (top) — 113×27 */}
      <div className="relative z-10">
        <Image
          src="/logo/macgence.png"
          alt="Macgence"
          width={113}
          height={27}
          className="h-[27px] w-auto"
          priority
        />
      </div>

      {/* Marketing copy / hero section */}
      <div className="relative z-10 mt-5 flex w-full flex-col gap-2 md:mt-auto md:w-[278px] md:gap-[19px]">
        <h2 className="text-lg font-medium leading-6 text-white md:text-xl md:leading-7">
          Find, evaluate, and manage{' '}
          <span className="text-[#92B2F5]">datasets</span> in one place.
        </h2>
        <ul className="hidden flex-col text-xs font-normal text-white md:flex">
          {BULLETS.map(item => (
            <li key={item} className="flex items-center gap-1.5 py-0.5">
              <svg className="shrink-0 text-[#92B2F5]" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.3-3.5-3.5 1.4-1.4 2.1 2.1 4.3-4.3 1.4 1.4-5.7 5.7Z" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
