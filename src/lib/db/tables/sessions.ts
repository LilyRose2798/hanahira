import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { users } from "@/lib/db/tables/users"
import { relations } from "drizzle-orm"

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
})
export type SessionsTable = typeof sessions

export const sessionUserRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))
