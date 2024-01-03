import { pgTable, text, PgColumnBuilderBase, timestamp } from "drizzle-orm/pg-core"
import { userRoleEnum } from "@/lib/db/tables/enums"
import { idColumn } from "@/lib/db/tables/utils"
import { defaultUserRole } from "@/lib/db/enums/user-role"

export const timestampMetaColumns = {
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
} satisfies Record<string, PgColumnBuilderBase>
export type TimestampMetaColumns = typeof timestampMetaColumns

export const users = pgTable("user", {
  ...idColumn,
  username: text("username").notNull().unique(),
  name: text("name"),
  email: text("email"),
  emailVerifiedAt: timestamp("email_verified_at", { mode: "date", withTimezone: true }),
  role: userRoleEnum("role").notNull().default(defaultUserRole),
  passwordHash: text("password_hash").notNull(),
  otpSecret: text("otp_secret"),
  ...timestampMetaColumns,
})
export type UsersTable = typeof users

export const userMetaColumns = {
  createdBy: text("created_by").notNull().references(() => users.id),
  updatedBy: text("updated_by").notNull().references(() => users.id),
} satisfies Record<string, PgColumnBuilderBase>
export type UserMetaColumns = typeof userMetaColumns

export const metaColumns = {
  ...userMetaColumns,
  ...timestampMetaColumns,
} satisfies Record<string, PgColumnBuilderBase>
export type MetaColumns = typeof metaColumns

export const schema = { users }
