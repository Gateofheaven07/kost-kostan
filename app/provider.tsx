'use client'
import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0, // Always consider data stale for real-time updates
            gcTime: 0, // Don't cache in memory
            refetchOnWindowFocus: true, // Refetch when window gains focus
            refetchOnMount: true, // Always refetch on mount
            refetchOnReconnect: true, // Refetch when reconnecting
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  )
}