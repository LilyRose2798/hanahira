"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { loggerLink, httpBatchLink, TRPCClientError } from "@trpc/client"
import React, { useState } from "react"
import { trpc } from "@/lib/trpc/client"
import SuperJSON from "superjson"
import { getUrl } from "@/lib/trpc/utils"
import { redirect } from "next/navigation"
import { toast } from "sonner"

const handleUnauthorizedErrorsOnClient = (error: unknown): boolean => {
  if (typeof window === "undefined") return false
  if (!(error instanceof TRPCClientError)) return false
  if (error.data?.code !== "UNAUTHORIZED") return false
  redirect("/sign-in")
  // return true
}

export const TrpcProvider = ({ children, cookies }: { children: React.ReactNode, cookies: string }) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        onError: err => {
          toast.error("Woops")
        },
        retry: (failureCount, error) => {
          if (handleUnauthorizedErrorsOnClient(error)) return false
          return failureCount < 3
        },
      },
      mutations: {
        onError: err => {
          toast.error("Woops")
        },
        retry: (_, error) => {
          handleUnauthorizedErrorsOnClient(error)
          return false
        },
      },
    },
  }))
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
