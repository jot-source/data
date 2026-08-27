import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getSessionUser } from '@/services/auth.service'
import { getDatasetById } from '@/services/dataset.service'
import { findPaidOrder } from '@/services/order.service'
import { recordDownload } from '@/services/download.service'
import { createSignedDownloadUrl } from '@/services/storage.service'
import { logger } from '@/lib/logger'

/**
 * GET /api/v1/datasets/[id]/download
 *
 * Serves the PAID dataset binary — gated on both (a) a valid session and (b) a
 * `paid` Order for this user+dataset. On success it signs a short-lived download
 * URL for the private `dataset-binaries` object, writes a `Download` audit row
 * (with the buyer's real IP), and redirects the browser to the signed URL.
 *
 * `dataset.binaryUrl` holds the storage PATH (not a URL) — the bucket is private,
 * so the URL is signed here at download time rather than stored.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const cookieStore = await cookies()
  const user = await getSessionUser(cookieStore)

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Sign in to download this dataset.' },
      { status: 401 }
    )
  }

  const dataset = await getDatasetById(id)

  if (!dataset) {
    return NextResponse.json({ success: false, error: 'Dataset not found.' }, { status: 404 })
  }

  if (!dataset.binaryUrl) {
    return NextResponse.json(
      { success: false, error: 'No downloadable file exists for this dataset yet.' },
      { status: 404 }
    )
  }

  // The purchase gate: only a completed (paid) order unlocks the binary.
  const order = await findPaidOrder(user.id, id)

  if (!order) {
    logger.warn(
      { userId: user.id, datasetId: id },
      'GET /datasets/[id]/download — blocked: no paid order'
    )
    return NextResponse.json(
      { success: false, error: 'Purchase this dataset to download it.' },
      { status: 403 }
    )
  }

  const signedUrl = await createSignedDownloadUrl('binary', dataset.binaryUrl, 60)

  if (!signedUrl) {
    return NextResponse.json(
      { success: false, error: 'Could not prepare the download. Please try again.' },
      { status: 500 }
    )
  }

  // Audit the download at the moment the buyer actually pulls the file. Take the
  // first hop of x-forwarded-for (the client) — Vercel/Supabase append proxies.
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null

  try {
    await recordDownload({ userId: user.id, datasetId: id, orderId: order.id, ipAddress })
  } catch (error) {
    // An audit-write failure must not block a paying customer's download.
    logger.error(
      { error, userId: user.id, datasetId: id },
      'GET /datasets/[id]/download — failed to write Download audit row (serving anyway)'
    )
  }

  logger.info(
    { userId: user.id, datasetId: id, orderId: order.id },
    'GET /datasets/[id]/download — signed URL issued'
  )

  return NextResponse.redirect(signedUrl)
}
