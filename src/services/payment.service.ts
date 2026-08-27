import { dodo } from '@/lib/dodo'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

interface CreateDatasetProductParams {
  title: string
  price: number // major units, e.g. 149.99
  currency: string // 3-letter ISO, e.g. 'USD'
}

/**
 * Creates a one-time Dodo Product for a dataset and returns its product id.
 * Called when a seller/admin uploads a dataset, so the dataset is purchasable
 * straight away — the returned id is stored as `dataset.dodoProductId` and later
 * used to build the checkout cart.
 *
 * Dodo prices are in the smallest currency unit (cents), so the major-unit
 * `price` is converted here ($149.99 → 14999). `tax_category` is
 * `digital_products` (datasets are digital goods).
 */
export async function createDatasetProduct(
  params: CreateDatasetProductParams
): Promise<string> {
  const { title, price, currency } = params

  logger.info({ title }, 'payment.service: creating Dodo product for dataset')

  try {
    const product = await dodo.products.create({
      name: title,
      tax_category: 'digital_products',
      price: {
        type: 'one_time_price',
        currency: currency as Parameters<typeof dodo.products.create>[0]['price']['currency'],
        price: Math.round(price * 100),
        discount: 0,
        purchasing_power_parity: false,
      },
    })

    logger.info(
      { title, productId: product.product_id },
      'payment.service: Dodo product created'
    )

    return product.product_id
  } catch (error) {
    logger.error({ error, title }, 'payment.service: failed to create Dodo product')
    throw error
  }
}

interface UpdateDatasetProductParams {
  dodoProductId: string
  title?: string
  price?: number // major units, e.g. 149.99
  currency?: string
}

/**
 * Updates an existing Dodo Product when a dataset's title, price, or currency
 * is modified in the application.
 */
export async function updateDatasetProduct(
  params: UpdateDatasetProductParams
): Promise<void> {
  const { dodoProductId, title, price, currency } = params

  logger.info({ dodoProductId }, 'payment.service: updating Dodo product')

  try {
    await dodo.products.update(dodoProductId, {
      ...(title && { name: title }),
      ...(price !== undefined && currency && {
        price: {
          type: 'one_time_price',
          currency: currency as Parameters<typeof dodo.products.create>[0]['price']['currency'],
          price: Math.round(price * 100),
          discount: 0,
          purchasing_power_parity: false,
        },
      }),
    })

    logger.info({ dodoProductId }, 'payment.service: Dodo product updated successfully')
  } catch (error) {
    logger.error({ error, dodoProductId }, 'payment.service: failed to update Dodo product')
    throw error
  }
}

interface SyncProductFromDodoParams {
  dodoProductId: string
  name?: string
  priceInCents?: number
  currency?: string
}

/**
 * Syncs product changes made in the Dodo Payments Dashboard back into the database.
 * Called when Dodo dispatches a product webhook (e.g. product.updated).
 */
export async function syncDatasetFromDodoProduct(
  params: SyncProductFromDodoParams
): Promise<boolean> {
  const { dodoProductId, name, priceInCents, currency } = params

  logger.info({ dodoProductId, name }, 'payment.service: syncing dataset from Dodo product')

  const existing = await prisma.dataset.findFirst({
    where: { dodoProductId },
  })

  if (!existing) {
    logger.warn({ dodoProductId }, 'payment.service: no matching dataset found for dodoProductId')
    return false
  }

  const updateData: { title?: string; price?: number; currency?: string } = {}
  if (name) updateData.title = name
  if (priceInCents !== undefined && priceInCents >= 0) {
    updateData.price = priceInCents / 100
  }
  if (currency) updateData.currency = currency

  if (Object.keys(updateData).length > 0) {
    await prisma.dataset.update({
      where: { id: existing.id },
      data: updateData,
    })
    logger.info({ datasetId: existing.id, updateData }, 'payment.service: dataset updated from Dodo product')
  }

  return true
}

/**
 * Retrieves a payment from Dodo by id. Used by the checkout success page to
 * verify a payment SERVER-SIDE (status + metadata) instead of trusting the
 * redirect's query params or waiting on the async webhook — important for local
 * dev where Dodo can't reach the webhook without a tunnel. Returns `null` on any
 * error (unknown id, network) so the caller treats it as "not yet verified".
 */
export async function retrievePayment(paymentId: string) {
  try {
    return await dodo.payments.retrieve(paymentId)
  } catch (error) {
    logger.warn({ error, paymentId }, 'payment.service: failed to retrieve payment from Dodo')
    return null
  }
}

interface CreateCheckoutSessionParams {
  orderId: string
  userId: string
  datasetId: string
  dodoProductId: string
  returnUrl: string
  cancelUrl: string
}

/**
 * Creates a Dodo-hosted checkout session for a single dataset purchase.
 * `metadata.orderId` is how the webhook (payment.service has no part in
 * receiving webhooks — see order.service + the webhook route) finds its way
 * back to our `orders` row once Dodo confirms the payment.
 *
 * Discounts are entered by the buyer directly on Dodo's checkout page
 * (`discount_codes`, enabled by default via `feature_flags.allow_discount_code`)
 * — Dodo validates the code and computes the final charged total itself, so
 * there's no app-side discount math to keep in sync.
 */
export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const { orderId, userId, datasetId, dodoProductId, returnUrl, cancelUrl } = params

  logger.info({ orderId, datasetId }, 'payment.service: creating Dodo checkout session')

  try {
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: dodoProductId, quantity: 1 }],
      metadata: { orderId, userId, datasetId },
      return_url: returnUrl,
      cancel_url: cancelUrl,
      // Only Dodo-recognised payment-method variants may appear here — an
      // unknown value makes Dodo reject the ENTIRE request body with a 422
      // ("unknown variant ..."), failing checkout for every dataset. ('sunbit'
      // was previously listed and is NOT a valid Dodo variant — it broke all
      // checkouts.) Keep this list to variants Dodo documents/enables.
      allowed_payment_method_types: [
        'upi_collect',
        'upi_intent',
        'credit',
        'debit',
        'klarna',
        'afterpay_clearpay',
        'billie',
      ],
    })

    logger.info(
      { orderId, sessionId: session.session_id },
      'payment.service: checkout session created'
    )

    return session
  } catch (error) {
    logger.error({ error, orderId, datasetId }, 'payment.service: failed to create checkout session')
    throw error
  }   
}
