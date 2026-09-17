'use client'

import { DatasetCardSkeleton } from './dataset-card-skeleton'
import { SkeletonFooter } from '@/components/ui/skeleton-footer'

export function DatasetsPageSkeleton() {
  return (
    <div className="fixed inset-0 z-[999] flex min-h-screen w-full flex-col overflow-y-auto bg-[#F5F7FA] font-public-sans text-[#181818]">
      {/* 1. Navbar Skeleton */}
      <div className="flex h-[72px] w-full shrink-0 items-center justify-between border-b border-[#F1F5F9] bg-white px-4 sm:px-10 lg:px-[120px]">
        {/* Brand Logo Pill */}
        <div className="h-9 w-32 animate-pulse rounded-lg bg-[#E7E9ED]"></div>

        {/* Middle Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <div className="h-5 w-24 animate-pulse rounded-full bg-[#E7E9ED]"></div>
          <div className="h-5 w-24 animate-pulse rounded-full bg-[#E7E9ED]"></div>
          <div className="h-5 w-24 animate-pulse rounded-full bg-[#E7E9ED]"></div>
          <div className="h-5 w-24 animate-pulse rounded-full bg-[#E7E9ED]"></div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-[#E7E9ED]"></div>
          <div className="h-10 w-28 animate-pulse rounded-[12px] bg-[#E7E9ED]"></div>
        </div>
      </div>

      {/* 2. Header Banner Wireframe (WHITE background matching Figma specs) */}
      <div className="w-full shrink-0 bg-white py-10 px-4 text-center border-b border-[#F1F5F9]">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-4">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-[#E7E9ED]"></div>
          <div className="h-[56px] w-full max-w-2xl animate-pulse rounded-[12px] bg-[#E7E9ED] shadow-xs"></div>
        </div>
      </div>

      {/* 3. Main 2-Column Layout */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 gap-8 px-4 sm:px-8 lg:px-12 pt-6 pb-16 items-start">
        {/* Left Sidebar Skeleton (320px) */}
        <aside className="hidden md:flex w-[320px] shrink-0 rounded-[16px] border border-[#CBD5E1] bg-white p-6 shadow-xs animate-pulse flex-col gap-6">
          <div className="h-5 w-24 rounded bg-[#E7E9ED]"></div>
          <div className="flex flex-col gap-3">
            <div className="h-5 w-28 rounded bg-[#E7E9ED]"></div>
            <div className="h-4 w-full rounded bg-[#E7E9ED]"></div>
            <div className="h-4 w-4/5 rounded bg-[#E7E9ED]"></div>
            <div className="h-4 w-3/4 rounded bg-[#E7E9ED]"></div>
          </div>
          <div className="flex flex-col gap-3 pt-4 border-t border-[#F1F5F9]">
            <div className="h-5 w-28 rounded bg-[#E7E9ED]"></div>
            <div className="h-4 w-full rounded bg-[#E7E9ED]"></div>
            <div className="h-4 w-4/5 rounded bg-[#E7E9ED]"></div>
          </div>
        </aside>

        {/* Right Dataset Cards Grid Skeleton */}
        <main className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="flex items-center justify-between pt-1">
            <div className="h-6 w-48 animate-pulse rounded bg-[#E7E9ED]"></div>
            <div className="h-6 w-28 animate-pulse rounded bg-[#E7E9ED]"></div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <DatasetCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>

      {/* 4. Figma Wireframe Footer */}
      <SkeletonFooter />
    </div>
  )
}
