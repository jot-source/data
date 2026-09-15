'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useDatasetFilters } from '@/stores/dataset-filters.store'
import { cn } from '@/lib/utils'

export function ExploreSearchHeader() {
  const setSearch = useDatasetFilters((s) => s.setSearch)
  const [draft, setDraft] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Hysteresis threshold to prevent scroll jitter:
          // Turn sticky state ON when scrollY > 60px
          // Turn sticky state OFF when scrollY < 20px
          setIsScrolled((prev) => {
            if (window.scrollY > 60) return true
            if (window.scrollY < 20) return false
            return prev
          })
          ticking = false
        })
        ticking = true
      }
    }

    handleScroll()
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
        'sticky top-[76px] z-40 shrink-0 transition-colors duration-300 ease-in-out font-public-sans',
        isScrolled ? 'pointer-events-none bg-transparent' : 'bg-[#0F1B3D]'
      )}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <div
          className={cn(
            'transition-all duration-300 ease-in-out',
            isScrolled
              ? 'pointer-events-auto ml-0 md:ml-[352px] max-w-[1000px] p-0 bg-transparent'
              : 'py-8 text-center'
          )}
        >
          <h1
            className={cn(
              'overflow-hidden font-public-sans font-bold text-white transition-all duration-300 ease-in-out',
              isScrolled
                ? 'h-0 text-[0px] opacity-0 mb-0'
                : 'h-auto text-2xl sm:text-3xl lg:text-4xl opacity-100 mb-6'
            )}
          >
            Search and explore datasets
          </h1>

          <form
            onSubmit={handleSubmit}
            className={cn(
              'relative flex h-[56px] items-center rounded-[12px] bg-white p-1.5 pl-5 transition-all duration-300 ease-in-out',
              isScrolled
                ? 'w-full max-w-[1000px] border border-[#CBD5E1] shadow-xs focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/20'
                : 'mx-auto max-w-2xl border border-white/20 shadow-xl focus-within:ring-2 focus-within:ring-[#2563EB]/30'
            )}
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Eg: search health care datasets"
              className="h-10 flex-1 bg-transparent font-public-sans text-sm text-[#181818] placeholder:text-[#8C8C8C] outline-none"
            />
            <button
              type="submit"
              className="h-10 shrink-0 rounded-lg bg-[#2563EB] px-6 font-public-sans text-sm font-semibold text-white transition-all hover:bg-[#1d4ed8] active:scale-95 shadow-xs cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
