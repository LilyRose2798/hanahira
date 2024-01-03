import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { metaColumns } from "@/lib/db/tables/users"
import { nanoidSecure } from "@/lib/db/tables/nanoid"
import { sqlNowPlusSeconds } from "@/lib/db/utils"

export const emailVerificationExpiresInSeconds = 3 * 60 * 60
export const emailVerificationExpiresInMillis = emailVerificationExpiresInSeconds * 1000

export const emailVerifications = pgTable("email_verification", {
  id: text("id").primaryKey().$defaultFn(nanoidSecure),
  email: text("email").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull()
    .default(sqlNowPlusSeconds(emailVerificationExpiresInSeconds)),
  ...metaColumns,
})
export type EmailVerificationsTable = typeof emailVerifications
