"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { loggerLink, httpBatchLink, TRPCClientError } from "@trpc/client"
import React, { useState } from "react"
import { trpc } from "@/lib/trpc/client"
import SuperJSON from "superjson"
import { getUrl } from "@/lib/trpc/utils"
import { redirect } from "next/navigation"
import { toast } from "sonner"

const onError = (err: unknown) => {
  if (typeof window === "undefined") return
  if (!(err instanceof TRPCClientError)) return
  if (err.data?.code === "UNAUTHORIZED") redirect("/sign-in")
  toast.error(err.message)
}

export const TrpcProvider = ({ children, cookies }: { children: React.ReactNode, cookies: string }) => {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { onError }, mutations: { onError } } }))
  const [trpcClient] = useState(() => trpc.createClient({
    transformer: SuperJSON,
    links: [
      loggerLink({
        enabled: op => process.env.NODE_ENV === "development" ||
          (op.direction === "down" && op.result instanceof Error),
      }),
      httpBatchLink({
        url: getUrl(),
        headers: () => ({
          cookie: cookies,
          "x-trpc-source": "react",
        }),
      }),
    ],
  }))
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}

export default TrpcProvider
