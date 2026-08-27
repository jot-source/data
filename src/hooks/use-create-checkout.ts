'use client'

import { useMutation } from '@tanstack/react-query'

interface CreateCheckoutResponse {
  success: true
  data: { checkoutUrl: string; orderId: string }
}

interface CreateCheckoutError {
  success: false
  error: string
}

async function createCheckout(datasetId: string) {
  const res = await fetch('/api/v1/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ datasetId }),
  })

  const body: CreateCheckoutResponse | CreateCheckoutError = await res.json()

  if (!res.ok || !body.success) {
    throw new Error(!body.success ? body.error : 'Failed to start checkout.')
  }

  return body.data
}

/** Starts a Dodo checkout session for a dataset, then redirects to Dodo's hosted page. */
export function useCreateCheckout(){
  return useMutation({
    mutationFn: createCheckout,
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl
    },
  })
}
