import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { retrievePayment } from '@/services/payment.service'

/**
 * An existing paid order for this user+dataset, if any — used to block
 * re-purchasing a dataset the user already owns.
 */
export async function findPaidOrder(userId: string, datasetId: string) {
  return prisma.order.findFirst({ where: { userId, datasetId, status: 'paid' } })
}

export async function createPendingOrder(params: {
  userId: string
  datasetId: string
  amount: Prisma.Decimal
  currency: string
}) {
  const { userId, datasetId, amount, currency } = params

  logger.info({ userId, datasetId }, 'order.service: creating pending order')

  return prisma.order.create({
    data: { userId, datasetId, amount, currency, status: 'pending' },
  })
}

export async function attachCheckoutSession(orderId: string, dodoSessionId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { dodoSessionId },
  })
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({ where: { id: orderId } })
}

/**
 * Transitions a pending order to paid. Guarded by `status: 'pending'` in the
 * update filter so a duplicate webhook delivery for the same payment (Dodo
 * retries on any non-2xx response) is a safe no-op instead of double-applying
 * side effects.
 */
export async function markOrderPaid(params: { orderId: string; dodoPaymentId: string }) {
  const { orderId, dodoPaymentId } = params

  const result = await prisma.order.updateMany({
    where: { id: orderId, status: 'pending' },
    data: { status: 'paid', dodoPaymentId, paidAt: new Date() },
  })

  if (result.count === 0) {
    logger.info({ orderId }, 'order.service: markOrderPaid no-op — already processed or unknown order')
    return
  }

  logger.info({ orderId, dodoPaymentId }, 'order.service: order marked paid')
}

export interface FinalizeResult {
  order: Awaited<ReturnType<typeof getOrderById>>
  authorized: boolean // the order exists AND belongs to the requesting user
  paid: boolean
}

/**
 * Checkout-success finalizer. Two guarantees before a download is ever granted:
 *
 *   1. **Ownership** — the order must belong to `userId`. We never reveal or
 *      mutate another user's order, so a guessed/leaked `orderId` is useless.
 *   2. **Payment authenticity** — if the order isn't already `paid`, we verify
 *      the payment with Dodo SERVER-SIDE: it must be `succeeded` AND its
 *      metadata (`orderId` + `userId`, set by us at checkout) must tie back to
 *      exactly this order and user. So a forged `payment_id`/`status` in the
 *      redirect URL can't unlock anything — only a real Dodo payment does.
 *
 * This makes the success page self-sufficient: it confirms the purchase without
 * depending on the async webhook (which can't reach localhost without a tunnel).
 * `markOrderPaid` is idempotent, so this and the webhook can both run safely.
 */
export async function finalizePurchase(params: {
  orderId: string
  userId: string
  paymentId?: string
}): Promise<FinalizeResult> {
  const { orderId, userId, paymentId } = params

  const order = await getOrderById(orderId)

  if (!order || order.userId !== userId) {
    logger.warn({ orderId, userId }, 'order.service: finalizePurchase — order missing or not owned by user')
    return { order: null, authorized: false, paid: false }
  }

  if (order.status === 'paid') {
    return { order, authorized: true, paid: true }
  }

  if (paymentId) {
    const payment = await retrievePayment(paymentId)
    const verified =
      !!payment &&
      payment.status === 'succeeded' &&
      payment.metadata?.orderId === order.id &&
      payment.metadata?.userId === userId

    if (verified) {
      await markOrderPaid({ orderId: order.id, dodoPaymentId: payment!.payment_id })
      logger.info({ orderId, userId }, 'order.service: finalizePurchase — payment verified with Dodo, order marked paid')
      return { order, authorized: true, paid: true }
    }

    logger.warn({ orderId, userId, paymentId }, 'order.service: finalizePurchase — payment did not verify')
  }

  return { order, authorized: true, paid: false }
}

/** Same idempotency guard as {@link markOrderPaid}, for the failure path. */
export async function markOrderFailed(params: { orderId: string }) {
  const { orderId } = params

  const result = await prisma.order.updateMany({
    where: { id: orderId, status: 'pending' },
    data: { status: 'failed' },
  })

  if (result.count === 0) {
    logger.info({ orderId }, 'order.service: markOrderFailed no-op — already processed or unknown order')
    return
  }

  logger.info({ orderId }, 'order.service: order marked failed')
}
