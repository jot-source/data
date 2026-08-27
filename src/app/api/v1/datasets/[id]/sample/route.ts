import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getSessionUser } from '@/services/auth.service'
import { getDatasetById } from '@/services/dataset.service'
import { logger } from '@/lib/logger'

/**
 * GET /api/v1/datasets/[id]/sample
 *
 * Redirects a LOGGED-IN user to the dataset's free sample file. No purchase is
 * required — samples are previews — but a session IS, so the "Download sample"
 * action is gated behind having an account.
 *
 * The sample object lives in the PUBLIC `dataset-samples` bucket, so this gates
 * the app's download path rather than the object itself (a copied raw CDN URL is
 * still reachable — the deliberate trade-off chosen for samples; the paid binary
 * uses a private bucket + signed URL instead — see the sibling `download` route).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const cookieStore = await cookies()
  const user = await getSessionUser(cookieStore)

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Sign in to download the sample.' },
      { status: 401 }
    )
  }

  const dataset = await getDatasetById(id)

  if (!dataset) {
    return NextResponse.json({ success: false, error: 'Dataset not found.' }, { status: 404 })
  }

  if (!dataset.sampleUrl) {
    return NextResponse.json(
      { success: false, error: 'No sample is available for this dataset.' },
      { status: 404 }
    )
  }

  logger.info(
    { userId: user.id, datasetId: id },
    'GET /datasets/[id]/sample — redirecting to public sample URL'
  )

  // Append Supabase's `?download=<name>` so the browser saves the file
  // (Content-Disposition: attachment) instead of rendering the CSV/JSON inline.
  const target = new URL(dataset.sampleUrl)
  const filename = target.pathname.split('/').pop() || 'sample'
  target.searchParams.set('download', filename)

  return NextResponse.redirect(target.toString())
}
