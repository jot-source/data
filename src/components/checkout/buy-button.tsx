'use client'

import { useCreateCheckout } from '@/hooks/use-create-checkout'

export function BuyButton({ datasetId }: { datasetId: string }) {
  const { mutate, isPending, error } = useCreateCheckout()

  return (
    <div>
      <button
        onClick={() => mutate(datasetId)}
        disabled={isPending}
        className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? 'Redirecting…' : 'Buy Now'}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error.message}</p>}
    </div>
  )
}
