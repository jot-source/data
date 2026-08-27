'use client'

import { useAuthModal } from '@/stores/auth-modal.store'
import { useCreateCheckout } from '@/hooks/use-create-checkout'

/**
 * Client-side glue for the three dataset actions, each synced to its API route
 * and gated the same way the backend gates it:
 *
 *   - downloadSample   → GET /api/v1/datasets/[id]/sample   (login required)
 *   - downloadDataset  → GET /api/v1/datasets/[id]/download (login + paid)
 *   - buy              → POST /api/v1/checkout              (login required)
 *
 * `isLoggedIn` is resolved on the server (from the auth cookie) and passed down,
 * so we can open the sign-in modal *before* hitting an endpoint that would just
 * 401 — no flash of a raw JSON error. The download actions navigate the top
 * frame to the route, which 307-redirects to the (attachment) file URL, so the
 * browser downloads without leaving the page.
 */
export function useDatasetActions(datasetId: string, isLoggedIn: boolean) {
  const { open } = useAuthModal()
  const checkout = useCreateCheckout()

  const requireAuth = (action: () => void) => {
    if (!isLoggedIn) {
      open('sign-in')
      return
    }
    action()
  }

  return {
    promptSignIn: () => open('sign-in'),
    downloadSample: () =>
      requireAuth(() => {
        window.location.href = `/api/v1/datasets/${datasetId}/sample`
      }),
    downloadDataset: () =>
      requireAuth(() => {
        window.location.href = `/api/v1/datasets/${datasetId}/download`
      }),
    buy: () => requireAuth(() => checkout.mutate(datasetId)),
    buying: checkout.isPending,
    buyError: checkout.error,
  }
}
