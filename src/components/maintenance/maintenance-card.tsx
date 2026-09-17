'use client'

import Link from 'next/link'

export function MaintenanceCard() {
  return (
    <div className="mx-auto w-full max-w-[1200px] flex flex-col items-center justify-center text-center font-public-sans py-8">
      {/* Settings / Gear Icon Badge */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DBEAFE] text-[#2563EB] mb-4 shadow-xs">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>

      {/* Eyebrow Label */}
      <span className="font-public-sans text-xs font-semibold tracking-wider text-[#2563EB] uppercase mb-2">
        SCHEDULED MAINTENANCE
      </span>

      {/* Main Heading */}
      <h2 className="font-public-sans text-2xl sm:text-3xl font-semibold text-[#2B2B2B] tracking-tight mb-3">
        We&apos;ll be back shortly
      </h2>

      {/* Description Paragraph */}
      <p className="font-public-sans text-sm sm:text-base text-[#616161] max-w-2xl leading-relaxed mb-6">
        Upgence is currently undergoing scheduled maintenance to improve performance. Thanks for your patience, we&apos;ll be back online soon.
      </p>

      {/* Support Contact Footer */}
      <p className="font-public-sans text-sm text-[#2B2B2B]">
        Need urgent help?{' '}
        <Link href="/contact" className="font-semibold text-[#2563EB] hover:underline">
          Contact support
        </Link>
      </p>
    </div>
  )
}
