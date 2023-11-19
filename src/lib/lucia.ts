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
  getUserAttributes: ({ username, name, email, role, password_hash, created_at, modified_at }): Omit<User, "id"> => (
    // eslint-disable-next-line camelcase
    { username, name, email, role, passwordHash: password_hash, createdAt: created_at, modifiedAt: modified_at }),
  // eslint-disable-next-line camelcase
  getSessionAttributes: ({ created_at }) => (
    // eslint-disable-next-line camelcase
    { createdAt: created_at }),
})

declare module "lucia" {
  interface Register {
    Lucia: typeof auth
    DatabaseUserAttributes: Omit<InferSelectModel<import("@/lib/db/tables/users").UsersTable, { dbColumnNames: true }>, "id">
    DatabaseSessionAttributes: Omit<InferSelectModel<import("@/lib/db/tables/sessions").SessionsTable, { dbColumnNames: true }>, "id" | "user_id" | "expires_at">
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
