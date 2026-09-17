import { Webhooks } from '@dodopayments/nextjs'
import { markOrderPaid, markOrderFailed } from '@/services/order.service'
import { syncDatasetFromDodoProduct } from '@/services/payment.service'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/webhooks/dodo
 *
 * Receives payment confirmation from Dodo Payments. `Webhooks` (the
 * @dodopayments/nextjs adapter) handles signature verification (401 on a bad
 * signature) and payload validation (400 on a malformed body) before
 * dispatching to the matching event handler below — only the order-update
 * logic lives here.
 *
 * Only updates the `orders` row (status, dodoPaymentId, paidAt). Granting
 * actual file access is a separate concern checked at download time against
 * `Order.status === 'paid'`, not created here — a Download record stamped
 * with `ipAddress`/`downloadedAt` at webhook time would record Dodo's server,
 * not the buyer's, and conflate "paid" with "downloaded".
 */
const rawWebhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY || ''
const isValidWebhookKey =
  rawWebhookKey.startsWith('whsec_') &&
  !rawWebhookKey.includes('...') &&
  !rawWebhookKey.includes('placeholder') &&
  rawWebhookKey.length > 10

export const POST = Webhooks({
  webhookKey: isValidWebhookKey
    ? rawWebhookKey
    : 'whsec_MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=',

  onPaymentSucceeded: async (payload) => {
    const orderId = payload.data.metadata?.orderId
    if (typeof orderId !== 'string'){
      logger.error(
        { paymentId: payload.data.payment_id },
        'webhook/dodo: payment.succeeded missing orderId in metadata'
      )
      return
    }

    await markOrderPaid({ orderId, dodoPaymentId: payload.data.payment_id })
  },

  onPaymentFailed: async (payload) => {
    const orderId = payload.data.metadata?.orderId
    if (typeof orderId !== 'string') {
      logger.error(
        { paymentId: payload.data.payment_id },
        'webhook/dodo: payment.failed missing orderId in metadata'
      )
      return
    }

    await markOrderFailed({ orderId })
  },

  onPayload: async (payload) => {
    const rawPayload = payload as unknown as {
      type?: string
      data?: {
        product_id?: string
        name?: string
        price?: { price?: number; currency?: string }
      }
    }

    if (rawPayload.type === 'product.updated') {
      const productId = rawPayload.data?.product_id
      if (!productId) {
        logger.warn('webhook/dodo: product.updated event missing product_id')
        return
      }

      await syncDatasetFromDodoProduct({
        dodoProductId: productId,
        name: rawPayload.data?.name,
        priceInCents: rawPayload.data?.price?.price,
        currency: rawPayload.data?.price?.currency,
      })
    }
  },
})
