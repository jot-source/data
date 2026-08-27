// components/datasets/explore-search-header.tsx
// Full-width "Search and explore datasets" header at the top of the explore page.
//
// One sticky element, two states cross-faded on scroll:
//   • Initial  → tall dark-blue hero spanning the full width, centered heading
//     + centered search bar.
//   • Scrolled → the blue fades out and the heading collapses; what's left is
//     just the search field, sitting on the page background inside the results
//     column (offset past the 320px filters sidebar) at the SAME level as the
//     FILTERS card. The outer band goes transparent + pointer-events-none so the
//     filters underneath stay visible and clickable; only the results-column
//     strip keeps an opaque background, to mask the cards scrolling beneath it.
//
// Uncontrolled input + local draft state: the store's `q` (which drives the
// actual API query) only updates on submit, not per keystroke, so typing never
// triggers a network request.
'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useDatasetFilters } from '@/stores/dataset-filters.store'
import { cn } from '@/lib/utils'

export function ExploreSearchHeader() {
  const setSearch = useDatasetFilters((s) => s.setSearch)
  const [draft, setDraft] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSearch(draft)
  }

  return (
    <div
      className={cn(
        'sticky top-0 z-40 shrink-0 transition-colors duration-300 ease-in-out',
        // Scrolled: the band itself is transparent and lets clicks fall through
        // to the filters sidebar behind its left region.
        isScrolled ? 'pointer-events-none bg-transparent' : 'bg-[#0F1B3D]'
      )}
    >
      <div className="mx-auto max-w-[1440px]">
        <div
          className={cn(
            'transition-all duration-300 ease-in-out',
            isScrolled
              ? // Offset past the sidebar so the strip covers only the results
                // column (opaque, to mask the cards scrolling under it) and lines
                // up with the dataset-card grid.
                'pointer-events-auto ml-[320px] bg-[#F5F7FA] px-8 py-4'
              : 'px-8 py-8 text-center'
          )}
        >
          <h1
            className={cn(
              'overflow-hidden font-public-sans font-semibold text-white transition-all duration-300',
              isScrolled ? 'h-0 text-[0px] opacity-0' : 'h-auto text-2xl opacity-100'
            )}
          >
            Search and explore datasets
          </h1>

          <form
            onSubmit={handleSubmit}
            className={cn(
              'relative flex items-center rounded-xl bg-white p-1.5 pl-4 shadow-md transition-all duration-300',
              isScrolled
                ? 'mt-0 w-full border border-[#E2E8F0] focus-within:border-[#2563EB]'
                : 'mx-auto mt-6 max-w-2xl border border-white/20 shadow-lg focus-within:ring-2 focus-within:ring-[#2563EB]/30'
            )}
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Eg: search health care datasets"
              className="h-10 flex-1 bg-transparent pr-3 font-public-sans text-sm text-[#181818] placeholder:text-[#8C8C8C] outline-none"
            />
            <button
              type="submit"
              className="h-10 shrink-0 rounded-lg bg-[#2563EB] px-6 font-public-sans text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] active:scale-95"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
