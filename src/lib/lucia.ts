import { Session, lucia } from "lucia"
// eslint-disable-next-line camelcase
import { nextjs_future } from "lucia/middleware"
import * as context from "next/headers"
import { postgres as postgresAdapter } from "@lucia-auth/adapter-postgresql"
import { client } from "@/lib/db"
import { env } from "@/lib/env.mjs"

export const auth = lucia({
  adapter: postgresAdapter(client, {
    user: "user",
    session: "user_session",
    key: "user_key",
  }),
  env: env.NODE_ENV === "development" ? "DEV" : "PROD",
  middleware: nextjs_future(),
  sessionCookie: { expires: false },
  getUserAttributes: ({ username, name, email, role }) => ({ username, name, email, role }),
})

export type Auth = typeof auth

export const getAuthRequest = () => auth.handleRequest("GET", context)
export const validateAuth = async (authRequest = getAuthRequest()) => (
  (await authRequest.validate()) ?? await authRequest.validateBearerToken())
export const invalidateAuth = (authRequest = getAuthRequest()) => authRequest.invalidate()
export const invalidateAuthAndReturn = <T>(x: T) => {
  invalidateAuth()
  return x
}
export const createSession = (userId: string) => auth.createSession({ userId, attributes: {} })
export const setSession = (session: Session | null = null, authRequest = getAuthRequest()) => authRequest.setSession(session)
