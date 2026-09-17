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
    <div className="flex min-h-screen flex-col bg-[#F5F7FA] text-[#181818] font-public-sans">
      {/* Hero Header Banner at top of page */}
      <ExploreSearchHeader />

      {/* Main 2-Column Layout: Left 320px Sidebar + Right 1000px Content (Max 1440px layout width) */}
      <div className="mx-auto flex w-full max-w-[1440px] gap-8 px-4 sm:px-8 lg:px-12 pt-8 sm:pt-10 pb-16 items-start">
        {/* Left Sticky Filters Sidebar (Figma Spec: 320px x 648px Hug, 24px padding, 16px radius) */}
        <aside className="sticky top-[76px] z-20 w-[320px] shrink-0 self-start hidden md:block">
          <FiltersSidebar />
        </aside>

        {/* Right Main Content Column (Aligned Search Box + Dataset Results Cards Grid) */}
        <main className="flex-1 min-w-0 flex flex-col gap-4">
          <DatasetResults isLoggedIn={isLoggedIn} savedDatasetIds={Array.from(savedIds)} />
        </main>
      </div>
    </div>
  )
}
