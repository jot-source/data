import Link from 'next/link'
import { cookies } from 'next/headers'
import { getSessionUser } from '@/services/auth.service'
import { finalizePurchase } from '@/services/order.service'
import { getDatasetById } from '@/services/dataset.service'
import { AutoRefresh } from './auto-refresh'

/**
 * GET /checkout/success?orderId=…&payment_id=…
 *
 * Confirms a purchase before showing any download link:
 *   1. the viewer must be signed in;
 *   2. the order must belong to them; and
 *   3. the payment must verify with Dodo (server-side) for this order + user.
 * Only then is the "Download dataset" link rendered. See `finalizePurchase`.
 */
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; payment_id?: string }>
}) {
  const { orderId, payment_id } = await searchParams

  const cookieStore = await cookies()
  const user = await getSessionUser(cookieStore)

  if (!user) {
    return (
      <Shell title="Please sign in" message="Sign in to view your purchase and download your dataset.">
        <NavButtons />
      </Shell>
    )
  }

  if (!orderId) {
    return (
      <Shell title="Order not found" message="We couldn't find that order.">
        <NavButtons />
      </Shell>
    )
  }

  const { order, authorized, paid } = await finalizePurchase({
    orderId,
    userId: user.id,
    paymentId: payment_id,
  })

  if (!authorized || !order) {
    return (
      <Shell title="Order not found" message="We couldn't find that order under your account.">
        <NavButtons />
      </Shell>
    )
  }

  const dataset = await getDatasetById(order.datasetId)

  if (!paid) {
    return (
      <Shell
        title="Finishing up your payment…"
        message="We're confirming your payment with Dodo. This can take a few seconds and updates automatically."
      >
        {/* Fallback for when the redirect had no payment_id — polls until the webhook lands. */}
        <AutoRefresh isPaid={false} />
        <NavButtons />
      </Shell>
    )
  }

  return (
    <Shell
      title="Payment confirmed"
      message={
        dataset
          ? `You now own "${dataset.title}". Your dataset is ready to download.`
          : 'Your dataset is ready to download.'
      }
      icon="check"
    >
      <div className="mt-8 flex flex-col items-center gap-4">
        {dataset && (
          <a
            href={`/api/v1/datasets/${dataset.id}/download`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#22C55E] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#16A34A]"
          >
            <DownloadIcon />
            Download dataset
          </a>
        )}
        <NavButtons datasetSlug={dataset?.slug} />
      </div>
    </Shell>
  )
}

function Shell({
  title,
  message,
  children,
  icon,
}: {
  title: string
  message: string
  children?: React.ReactNode
  icon?: 'check'
}) {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      {icon === 'check' && (
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#22C55E]/15">
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="14" fill="#22C55E" />
            <path d="M10 16.5l4 4 8-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      <p className="mt-4 text-white/70">{message}</p>
      {children}
    </main>
  )
}

function NavButtons({ datasetSlug }: { datasetSlug?: string | null }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      {datasetSlug && (
        <Link
          href={`/datasets/${datasetSlug}`}
          className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
        >
          View dataset
        </Link>
      )}
      <Link
        href="/datasets"
        className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
      >
        Browse more datasets
      </Link>
      <Link
        href="/"
        className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
      >
        Back home
      </Link>
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10" />
    </svg>
  )
}
