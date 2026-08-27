// lib/dodo.ts — Dodo Payments SDK client singleton
import DodoPayments from 'dodopayments'

const globalForDodo = globalThis as unknown as { dodo: DodoPayments }

function createDodoClient() {
  return new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment:
      (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode' | undefined) ??
      'test_mode',
  })
}

export const dodo = globalForDodo.dodo ?? createDodoClient()

if (process.env.NODE_ENV !== 'production') globalForDodo.dodo = dodo
