import { pgTable } from "drizzle-orm/pg-core"
import { metaColumns } from "@/lib/db/tables/users"
import { idColumnSecure, expiresAtColumn } from "@/lib/db/tables/utils"

export const sessionExpiresInSeconds = 30 * 24 * 60 * 60
export const sessionExpiresInMillis = sessionExpiresInSeconds * 1000

export const sessions = pgTable("session", {
  ...idColumnSecure,
  ...expiresAtColumn(sessionExpiresInSeconds),
  ...metaColumns,
})
export type SessionsTable = typeof sessions
