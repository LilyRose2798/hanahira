import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { metaColumns } from "@/lib/db/tables/users"
import { nanoid } from "@/lib/db/tables/nanoid"

export const sessionExpiresInSeconds = 30 * 24 * 60 * 60
export const sessionExpiresInMillis = sessionExpiresInSeconds * 1000
export const getSessionExpiresAt = () => new Date(Date.now() + sessionExpiresInMillis)

export const sessions = pgTable("session", {
  id: text("id").primaryKey().$defaultFn(() => nanoid(24)),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull().$defaultFn(getSessionExpiresAt),
  ...metaColumns,
})
export type SessionsTable = typeof sessions
