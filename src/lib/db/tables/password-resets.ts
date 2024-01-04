import { pgTable } from "drizzle-orm/pg-core"
import { metaColumns } from "@/lib/db/tables/users"
import { idColumnSecure, expiresAtColumn } from "@/lib/db/tables/utils"

export const passwordResetExpiresInSeconds = 60 * 60
export const passwordResetExpiresInMillis = passwordResetExpiresInSeconds * 1000

export const passwordResets = pgTable("password_reset", {
  ...idColumnSecure,
  ...expiresAtColumn(passwordResetExpiresInSeconds),
  ...metaColumns,
})
export type PasswordResetsTable = typeof passwordResets
