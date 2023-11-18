import { Lucia } from "lucia"
import { nextjs } from "lucia/middleware"
import { headers, cookies } from "next/headers"
import { PostgresJsAdapter } from "@lucia-auth/adapter-postgresql"
import { client } from "@/lib/db"
import { env } from "@/lib/env.mjs"

export const auth = new Lucia(new PostgresJsAdapter(client, {
  user: "user",
  session: "session",
}), {
  middleware: nextjs(),
  sessionCookie: {
    name: "session",
    expires: false,
    attributes: {
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
    },
  },
  getUserAttributes: ({ username, name, email, role }) => ({ username, name, email, role }),
  getSessionAttributes: ({}) => ({}),
})

declare module "lucia" {
  interface Register {
    Lucia: typeof auth
    DatabaseUserAttributes: Omit<import("@/lib/db/schemas/users").User, "id" | "createdAt" | "modifiedAt">
    DatabaseSessionAttributes: {}
  }
}

export const getAuthRequest = (requestMethod: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET") => (
  auth.handleRequest(requestMethod, { headers, cookies, request: null }))
export const validateAuth = async (authRequest = getAuthRequest()) => (
  (await authRequest.validate()) ?? await authRequest.validateBearerToken())
export const invalidateAuth = (authRequest = getAuthRequest()) => authRequest.invalidate()
export const invalidateAuthAndReturn = <T>(x: T) => {
  invalidateAuth()
  return x
}
