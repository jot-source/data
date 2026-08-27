// components/landing/brand-logo.tsx
// Macgence wordmark (public/logo/macgence.png) — the asset is white-on-transparent,
// so on light backgrounds we CSS-invert it to render dark; on dark backgrounds
// (footer) it's used as-is.
// `variant="light"` (default) → inverted/dark, for white/light backgrounds (header);
// `variant="dark"` → white, for dark backgrounds (footer).

import Image from 'next/image'

export function BrandLogo({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  return (
    <div className="flex items-center px-2 py-1">
      <Image
        src="/logo/macgence.png"
        alt="Macgence"
        width={169}
        height={40}
        className={`h-8 w-auto ${variant === 'light' ? 'invert' : ''}`}
        priority
      />
    </div>
  )
}
