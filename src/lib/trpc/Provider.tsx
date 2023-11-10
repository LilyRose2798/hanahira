"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import React, { useState } from "react"
import { trpc } from "@/lib/trpc/client"
import SuperJSON from "superjson"

const getBaseUrl = () => (typeof window === "undefined" ? "http://localhost:3000" : "")
const getUrl = () => `${getBaseUrl()}/api/trpc`

export const TrpcProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient({}))
  const [trpcClient] = useState(() => trpc.createClient({
    transformer: SuperJSON,
    links: [httpBatchLink({ url: getUrl() })],
  }))
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}

export default TrpcProvider
