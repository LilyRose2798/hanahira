import { TRPCError } from "@trpc/server"

export const parseFound = <T>(x: T | undefined) => {
  if (!x) throw new TRPCError({ code: "NOT_FOUND", message: "Not found" })
  return x
}
export const parseFoundFirst = <T>(x: T[]) => {
  if (!x) throw new TRPCError({ code: "NOT_FOUND", message: "Not found" })
  return x[0]
}
export const parseCreated = <T>(x: T[]) => {
  if (!x) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create" })
  return x[0]
}
