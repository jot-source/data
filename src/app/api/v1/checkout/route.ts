import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getSessionUser } from '@/services/auth.service'
import { getDatasetById } from '@/services/dataset.service'
import { findPaidOrder, createPendingOrder, attachCheckoutSession } from '@/services/order.service'
import { createCheckoutSession } from '@/services/payment.service'
import { createCheckoutSchema } from '@/validations/checkout.schema'
import { logger } from '@/lib/logger'

/**
 * POST /api/v1/checkout
 *
 * Starts a Dodo-hosted checkout for a single dataset:
 *   1. Resolve the dataset's current price/currency/dodoProductId from our DB
 *      (the price the client may have shown is never trusted).
 *   2. Create a `pending` Order row.
 *   3. Create a Dodo checkout session for that dataset's product, carrying
 *      `orderId` in metadata so the webhook can find its way back here.
 *   4. Return the Dodo-hosted checkout_url for the client to redirect to.
 *
 * Body: { datasetId: string (uuid) }
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const user = await getSessionUser(cookieStore)

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Request body must be valid JSON.' },
      { status: 400 }
    )
  }

  const parsed = createCheckoutSchema.safeParse(body)
  if (!parsed.success) {
    logger.warn(
      { userId: user.id, issues: parsed.error.issues },
      'POST /api/v1/checkout — body validation failed'
    )
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request.',
        details: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 400 }
    )
  }

  const { datasetId } = parsed.data

  const dataset = await getDatasetById(datasetId)
  if (!dataset) {
    return NextResponse.json({ success: false, error: 'Dataset not found.' }, { status: 404 })
  }

  if (!dataset.dodoProductId) {
    logger.error({ datasetId }, 'POST /api/v1/checkout — dataset has no dodoProductId, cannot checkout')
    return NextResponse.json(
      { success: false, error: 'This dataset is not available for purchase yet.' },
      { status: 400 }
    )
  }

  const existingPaidOrder = await findPaidOrder(user.id, datasetId)
  if (existingPaidOrder) {
    return NextResponse.json(
      { success: false, error: 'You already own this dataset.' },
      { status: 409 }
    )
  }

  logger.info({ userId: user.id, datasetId }, 'POST /api/v1/checkout — starting checkout')

  try {
    const order = await createPendingOrder({
      userId: user.id,
      datasetId: dataset.id,
      amount: dataset.price,
      currency: dataset.currency,
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const session = await createCheckoutSession({
      orderId: order.id,
      userId: user.id,
      datasetId: dataset.id,
      dodoProductId: dataset.dodoProductId,
      returnUrl: `${appUrl}/checkout/success?orderId=${order.id}`,
      cancelUrl: `${appUrl}/datasets/${dataset.slug}`,
    })

    if (!session.checkout_url) {
      logger.error({ orderId: order.id }, 'POST /api/v1/checkout — Dodo did not return a checkout_url')
      return NextResponse.json(
        { success: false, error: 'Failed to start checkout. Please try again.' },
        { status: 502 }
      )
    }

    await attachCheckoutSession(order.id, session.session_id)

    logger.info(
      { orderId: order.id, sessionId: session.session_id },
      'POST /api/v1/checkout — checkout session ready'
    )

    return NextResponse.json(
      { success: true, data: { checkoutUrl: session.checkout_url, orderId: order.id } },
      { status: 201 }
    )
  } catch (error) {
    logger.error({ error, userId: user.id, datasetId }, 'POST /api/v1/checkout — failed')
    return NextResponse.json(
      { success: false, error: 'Failed to start checkout. Please try again later.' },
      { status: 500 }
    )
  }
}
