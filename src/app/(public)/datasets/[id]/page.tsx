import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getDatasetBySlug, getRelatedDatasets } from '@/services/dataset.service'
import { getSessionUser } from '@/services/auth.service'
import { findPaidOrder } from '@/services/order.service'
import { isDatasetSaved } from '@/actions/saved-dataset.actions'
import {
  DatasetHeading,
  StickyNav,
  Specifications,
  DataQuality,
  PricingOptions,
  PricingSidebar,
  FAQSection,
  RelatedDatasets,
  EnterpriseConsultation,
} from '@/components/each-dataset'

export default async function DatasetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: slug } = await params
  const dataset = await getDatasetBySlug(slug)

  if (!dataset) {
    notFound()
  }

  // Fetch related datasets (4 max)
  const relatedDatasets = await getRelatedDatasets(
    { id: dataset.id, industry: dataset.industry, category: dataset.category },
    4
  )

  // Resolve viewer state server-side (from the auth cookie) so the pricing UI
  // can gate exactly like the API does: sample = login, download = login + paid.
  // `owned` is a paid Order for this user+dataset — the same check the download
  // endpoint enforces. Reading cookies makes this page dynamic (per-user), which
  // is correct since ownership can't be statically cached.
  const cookieStore = await cookies()
  const user = await getSessionUser(cookieStore)
  const isLoggedIn = Boolean(user)
  const owned = user ? Boolean(await findPaidOrder(user.id, dataset.id)) : false
  const savedResult = await isDatasetSaved(dataset.id)
  const isSaved = savedResult.saved

  // Serialize dataset to plain JSON to avoid Decimal/BigInt issues in client components
  const safeDataset = JSON.parse(
    JSON.stringify(dataset, (_key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    )
  )

  // Never ship the private binary storage path to the client — downloads go
  // through the gated /download endpoint, which signs the URL server-side.
  delete safeDataset.binaryUrl

  // Price is auth-gated: only send it to a logged-in viewer. Logged-out users
  // receive `null` (the real price never leaves the server) and the pricing UI
  // blurs it behind a sign-in prompt.
  if (!isLoggedIn) {
    safeDataset.price = null
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#181818] w-full">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-6">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-[#616161]">
          <span className="hover:text-[#181818] cursor-pointer">Home</span>
          <span className="text-[#CBD5E1]">&gt;</span>
          <span className="hover:text-[#181818] cursor-pointer">Marketplace</span>
          <span className="text-[#CBD5E1]">&gt;</span>
          <span className="font-medium text-[#181818]">{safeDataset.title}</span>
        </div>

        {/* ──── Two-column layout ──── */}
        {/* items-stretch (default) so the right column matches the tall left
            column's height — that gives the sticky pricing sidebar room to
            stay pinned all the way down instead of scrolling out of view. */}
        <div className="flex gap-6 items-stretch">

          {/* LEFT: Main content — 748px fixed */}
          <div className="w-[748px] shrink-0 flex flex-col gap-8 rounded-3xl border border-[#CBD5E1] bg-white p-6">
            {/* Hero heading */}
            <DatasetHeading dataset={safeDataset} isLoggedIn={isLoggedIn} isSaved={isSaved} />

            {/* Sticky nav toggle */}
            <StickyNav />

            {/* Content sections — gap 64px between major groups per Figma */}
            <div className="flex flex-col gap-16">
              <Specifications dataset={safeDataset} />
              <DataQuality />
              <PricingOptions dataset={safeDataset} isLoggedIn={isLoggedIn} owned={owned} />
              <FAQSection />
            </div>
          </div>

          {/* RIGHT: Pricing sidebar — 420px fixed */}
          <div className="w-[420px] shrink-0">
            <PricingSidebar dataset={safeDataset} isLoggedIn={isLoggedIn} owned={owned} />
          </div>
        </div>

        {/* ──── Enterprise Consultation Block ──── */}
        {/* ──── Enterprise Consultation Block ──── */}
        <EnterpriseConsultation />

        {/* ──── Related Datasets — full width, 2×2 grid, gap 24px ──── */}
        <div className="mt-12">
          <RelatedDatasets datasets={relatedDatasets} />
        </div>
      </div>
    </div>
  )
}
