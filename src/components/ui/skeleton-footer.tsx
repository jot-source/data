'use client'

export function SkeletonFooter() {
  return (
    <div className="w-full bg-[#F8FAFC] border-t border-[#E2E8F0] font-public-sans">
      {/* Figma Rectangle 5545: Width 1,440px, Height 501px */}
      <div className="mx-auto max-w-[1440px] h-[501px] flex flex-col justify-between py-10 px-4 sm:px-8 lg:px-16">
        {/* Upper 4 Columns matching Figma Data loader screen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Logo & Tagline */}
          <div className="flex flex-col gap-4">
            <div className="h-7 w-36 animate-pulse rounded-lg bg-[#E7E9ED]"></div>
            <div className="h-3.5 w-48 animate-pulse rounded bg-[#E7E9ED]"></div>
            <div className="h-3.5 w-40 animate-pulse rounded bg-[#E7E9ED]"></div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-3">
            <div className="h-5 w-24 animate-pulse rounded bg-[#E7E9ED] mb-1"></div>
            <div className="h-3.5 w-28 animate-pulse rounded bg-[#E7E9ED]"></div>
            <div className="h-3.5 w-24 animate-pulse rounded bg-[#E7E9ED]"></div>
            <div className="h-3.5 w-32 animate-pulse rounded bg-[#E7E9ED]"></div>
            <div className="h-3.5 w-28 animate-pulse rounded bg-[#E7E9ED]"></div>
            <div className="h-3.5 w-20 animate-pulse rounded bg-[#E7E9ED]"></div>
            <div className="h-3.5 w-24 animate-pulse rounded bg-[#E7E9ED]"></div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-3">
            <div className="h-5 w-24 animate-pulse rounded bg-[#E7E9ED] mb-1"></div>
            <div className="h-3.5 w-28 animate-pulse rounded bg-[#E7E9ED]"></div>
            <div className="h-3.5 w-32 animate-pulse rounded bg-[#E7E9ED]"></div>
            <div className="h-3.5 w-24 animate-pulse rounded bg-[#E7E9ED]"></div>
            <div className="h-3.5 w-28 animate-pulse rounded bg-[#E7E9ED]"></div>
            <div className="h-3.5 w-20 animate-pulse rounded bg-[#E7E9ED]"></div>
            <div className="h-3.5 w-24 animate-pulse rounded bg-[#E7E9ED]"></div>
          </div>

          {/* Column 4 */}
          <div className="flex flex-col gap-3">
            <div className="h-5 w-24 animate-pulse rounded bg-[#E7E9ED] mb-1"></div>
            <div className="h-3.5 w-32 animate-pulse rounded bg-[#E7E9ED]"></div>
            <div className="h-3.5 w-28 animate-pulse rounded bg-[#E7E9ED]"></div>
            <div className="h-3.5 w-24 animate-pulse rounded bg-[#E7E9ED]"></div>
            <div className="h-3.5 w-28 animate-pulse rounded bg-[#E7E9ED]"></div>
            <div className="h-3.5 w-32 animate-pulse rounded bg-[#E7E9ED]"></div>
            <div className="h-3.5 w-20 animate-pulse rounded bg-[#E7E9ED]"></div>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E2E8F0] pt-6">
          <div className="h-4 w-40 animate-pulse rounded-full bg-[#E7E9ED]"></div>
          <div className="h-4 w-48 animate-pulse rounded-full bg-[#E7E9ED]"></div>
        </div>
      </div>
    </div>
  )
}
