import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { metaColumns } from "@/lib/db/tables/users"
import { nanoidSecure } from "@/lib/db/tables/nanoid"
import { sqlNowPlusSeconds } from "@/lib/db/utils"

export const sessionExpiresInSeconds = 30 * 24 * 60 * 60
export const sessionExpiresInMillis = sessionExpiresInSeconds * 1000

export const sessions = pgTable("session", {
  id: text("id").primaryKey().$defaultFn(nanoidSecure),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull().
    default(sqlNowPlusSeconds(sessionExpiresInSeconds)),
  ...metaColumns,
})
export type SessionsTable = typeof sessions
