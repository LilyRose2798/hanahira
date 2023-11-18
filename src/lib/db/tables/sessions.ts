import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { users } from "@/lib/db/tables/users"

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
})
export const SessionsTable = typeof sessions
