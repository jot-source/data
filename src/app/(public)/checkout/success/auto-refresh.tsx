'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Payment confirmation is asynchronous: Dodo redirects the buyer to this page
 * immediately, but the `payment.succeeded` webhook that flips the Order to
 * `paid` can arrive a few seconds later. While the Order is still `pending`,
 * this re-runs the server component every 3s (up to ~30s) via `router.refresh()`
 * so the page updates to "Payment confirmed" on its own — no manual refresh.
 *
 * Renders nothing; unmounts (and stops polling) once `isPaid` is true.
 */
export function AutoRefresh({ isPaid }: { isPaid: boolean }) {
  const router = useRouter()

  useEffect(() => {
    if (isPaid) return

    let ticks = 0
    const id = setInterval(() => {
      ticks += 1
      router.refresh()
      if (ticks >= 10) clearInterval(id)
    }, 3000)

    return () => clearInterval(id)
  }, [isPaid, router])

  return null
}
