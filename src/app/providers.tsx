'use client'

import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '@/lib/query-client'

// App-wide client providers. TanStack Query handles server-state caching
// (see docs/tech-stack-decisions.md). UI-only state uses Zustand stores, which
// need no provider — so this is the only client provider the app mounts.
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
