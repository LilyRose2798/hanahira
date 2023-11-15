import { pgTable, text, bigint } from "drizzle-orm/pg-core"
import { users } from "@/lib/db/tables/users"

export const sessions = pgTable("user_session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  activeExpires: bigint("active_expires", { mode: "number" }).notNull(),
  idleExpires: bigint("idle_expires", { mode: "number" }).notNull(),
})
export const SessionsTable = typeof sessions
