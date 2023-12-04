import { TRPCClientError } from "@trpc/client"
import { AppRouter } from "@/lib/trpc/routers"
import { redirect } from "next/navigation"

export const getBaseUrl = () => (typeof window === "undefined" ? `http://localhost:${process.env.PORT || 3000}` : "")
export const getUrl = () => `${getBaseUrl()}/api/trpc`

export const isTRPCClientError = (error: unknown): error is TRPCClientError<AppRouter> => error instanceof TRPCClientError

export const authErrorRedirect = (error: unknown) => {
  if (!isTRPCClientError(error)) throw error
  if (error.data?.code === "UNAUTHORIZED") redirect("/sign-in")
  throw error
}

export const authErrorHandle = (error: unknown) => {
  if (!isTRPCClientError(error)) throw error
  if (error.data?.code === "UNAUTHORIZED") return undefined
  throw error
}
