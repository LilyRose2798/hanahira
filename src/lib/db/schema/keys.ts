import { pgTable, text } from "drizzle-orm/pg-core"
import { users } from "@/lib/db/schema/users"

export const keys = pgTable("user_key", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  hashedPassword: text("hashed_password"),
})
