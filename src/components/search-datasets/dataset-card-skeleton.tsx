'use client'

export function DatasetCardSkeleton() {
  return (
    <div className="flex h-[280px] flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs animate-pulse font-public-sans">
      {/* Frame 1: Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 w-full">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-[#E7E9ED]"></div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-3/4 rounded bg-[#E7E9ED]"></div>
            <div className="h-3 w-1/3 rounded bg-[#E7E9ED]"></div>
          </div>
        </div>
        <div className="h-6 w-24 shrink-0 rounded-full bg-[#E7E9ED]"></div>
      </div>

      {/* Frame 2: Stat Chips */}
      <div className="my-3 border-t border-[#F1F5F9] pt-3.5 flex gap-2">
        <div className="h-7 w-24 rounded-lg bg-[#E7E9ED]"></div>
        <div className="h-7 w-20 rounded-lg bg-[#E7E9ED]"></div>
        <div className="h-7 w-24 rounded-lg bg-[#E7E9ED]"></div>
      </div>

      {/* Frame 3: Metadata */}
      <div className="mt-auto border-t border-[#F1F5F9] pt-3.5 flex justify-between items-center">
        <div className="h-3.5 w-32 rounded bg-[#E7E9ED]"></div>
        <div className="h-3.5 w-24 rounded bg-[#E7E9ED]"></div>
      </div>

      {/* Frame 4: Actions */}
      <div className="mt-3.5 flex items-center justify-between border-t border-[#F1F5F9] pt-3.5">
        <div className="h-8 w-20 rounded-lg bg-[#E7E9ED]"></div>
        <div className="h-9 w-32 rounded-lg bg-[#E7E9ED]"></div>
      </div>
    </div>
  )
}
