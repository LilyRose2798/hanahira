import { Lucia } from "lucia"
import { nextjs } from "lucia/middleware"
import { headers, cookies } from "next/headers"
import { PostgresJsAdapter } from "@lucia-auth/adapter-postgresql"
import { client } from "@/lib/db"
import { env } from "@/lib/env.mjs"
import { User } from "@/lib/db/schemas/users"
import { InferSelectModel } from "drizzle-orm"

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
  // eslint-disable-next-line camelcase
  getUserAttributes: ({ id, username, name, email, role, password_hash, created_at, modified_at }): User => (
    // eslint-disable-next-line camelcase
    { id, username, name, email, role, passwordHash: password_hash, createdAt: created_at, modifiedAt: modified_at }),
  getSessionAttributes: ({}) => ({}),
})

declare module "lucia" {
  interface Register {
    Lucia: typeof auth
    DatabaseUserAttributes: InferSelectModel<import("@/lib/db/tables/users").UsersTable, { dbColumnNames: true }>
    DatabaseSessionAttributes: {}
  }
}

export const getAuthRequest = (csrfProtection: boolean = false) => (
  auth.handleRequest(csrfProtection ? "POST" : "GET", { headers, cookies }))
export const validateAuth = async (csrfProtection: boolean = false) => (
  (async x => (await x.validate()) ?? await x.validateBearerToken()))(getAuthRequest(csrfProtection))
export const invalidateAuthAndReturn = <T>(x: T) => {
  getAuthRequest().invalidate()
  return x
}
