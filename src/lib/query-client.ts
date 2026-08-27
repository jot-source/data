import { QueryClient } from '@tanstack/react-query'

// Config per docs/tech-stack-decisions.md — datasets/orders don't change
// every second, so a 5 min staleTime avoids refetch storms.
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        retry: 2,
      },
    },
  })
}


