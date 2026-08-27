// app/(public)/datasets/page.tsx
// Explore/browse page — reached from the hero's "Explore marketplace" CTA.
//
// Scroll model: The page scrolls naturally (SiteHeader scrolls away with it).
// ExploreSearchHeader is a full-width sticky band that starts as a tall blue
// hero and, on scroll, collapses to just the search field sitting in the
// results column. Its band goes transparent there, so the FiltersSidebar —
// which sticks at the same top-0 — shows through and sits level with the search
// bar, while the DatasetResults grid scrolls underneath.

import { cookies } from 'next/headers'
import { getSessionUserId } from '@/services/auth.service'
import { getSavedDatasetIds } from '@/actions/saved-dataset.actions'
import { ExploreSearchHeader } from '@/components/search-datasets/explore-search-header'
import { FiltersSidebar } from '@/components/search-datasets/filters-sidebar'
import { DatasetResults } from '@/components/search-datasets/dataset-results'

export default async function DatasetsPage() {
  const cookieStore = await cookies()
  const userId = await getSessionUserId(cookieStore)
  const isLoggedIn = Boolean(userId)
  const savedIds = await getSavedDatasetIds()

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA] text-[#181818]">
      <ExploreSearchHeader />

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 items-start">
        <aside className="sticky top-0 h-screen w-[320px] shrink-0 overflow-y-auto border-r border-[#E5E5E5] bg-[#F5F7FA] pb-8">
          <FiltersSidebar />
        </aside>

        <main className="flex-1 pb-16">
          <DatasetResults isLoggedIn={isLoggedIn} savedDatasetIds={Array.from(savedIds)} />
        </main>
      </div>
    </div>
  )
}
