import { pgTable, text } from "drizzle-orm/pg-core"
import { metaColumns } from "@/lib/db/tables/users"
import { idColumnSecure, expiresAtColumn } from "@/lib/db/tables/utils"

export const emailVerificationExpiresInSeconds = 3 * 60 * 60
export const emailVerificationExpiresInMillis = emailVerificationExpiresInSeconds * 1000

export const emailVerifications = pgTable("email_verification", {
  ...idColumnSecure,
  email: text("email").notNull(),
  ...expiresAtColumn(emailVerificationExpiresInSeconds),
  ...metaColumns,
})
export type EmailVerificationsTable = typeof emailVerifications
