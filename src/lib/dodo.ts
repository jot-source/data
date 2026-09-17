// lib/dodo.ts — Dodo Payments SDK client
import DodoPayments from 'dodopayments'

export function getDodoClient(): DodoPayments {
  const bearerToken = process.env.DODO_PAYMENTS_API_KEY || ''
  const environment = (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode' | undefined) ?? 'test_mode'

  return new DodoPayments({
    bearerToken,
    environment,
  })
}

// Proxy wrapper so existing calls `dodo.checkoutSessions.create` always use the latest environment variables
export const dodo = new Proxy({} as DodoPayments, {
  get(_target, prop: keyof DodoPayments) {
    const client = getDodoClient()
    const value = client[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

