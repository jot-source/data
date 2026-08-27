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
    <div className="relative hidden w-[333px] shrink-0 flex-col overflow-hidden bg-[#1A2552] px-[27px] pb-[62px] pt-[29px] md:flex">
      {/* Decorative ellipses (#212C57) — exact Figma positions, clipped */}
      <span className="pointer-events-none absolute left-[-21px] top-[461px] h-[201px] w-[201px] rounded-full bg-[#212C57]" />
      <span className="pointer-events-none absolute left-[266px] top-[-8px] h-[101px] w-[101px] rounded-full bg-[#212C57]" />

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

      {/* Marketing copy (bottom) — Frame 1272629757, 19px gap */}
      <div className="relative z-10 mt-auto flex w-[278px] flex-col gap-[19px]">
        <h2 className="text-xl font-medium leading-7 text-white">
          Find, evaluate, and manage{' '}
          <span className="text-[#92B2F5]">datasets</span> in one place.
        </h2>
        <ul className="flex flex-col text-xs font-normal text-white">
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
