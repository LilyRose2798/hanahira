"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { loggerLink, httpBatchLink, TRPCClientError } from "@trpc/client"
import React, { useState } from "react"
import { trpc } from "@/lib/trpc/client"
import SuperJSON from "superjson"
import { getUrl } from "@/lib/trpc/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AppRouter } from "@/lib/trpc/routers"

export const TrpcProvider = ({ children, cookies }: { children: React.ReactNode, cookies: string }) => {
  const router = useRouter()
  const [retry] = useState(() => (failureCount: number, err: unknown) => {
    if (typeof window === "undefined") return false
    if (!(err instanceof TRPCClientError)) return false
    const e = err as TRPCClientError<AppRouter>
    if (e.data?.httpStatus && e.data.httpStatus >= 500 && failureCount < 4) return true
    toast.error(e.message)
    if (e.data?.code === "UNAUTHORIZED") router.push("/sign-in")
    return false
  })
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry }, mutations: { retry } } }))
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
