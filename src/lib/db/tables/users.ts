import { relations } from "drizzle-orm"
import { pgTable, text, pgEnum } from "drizzle-orm/pg-core"
import { posts } from "@/lib/db/tables/posts"
import { idColumn, timestampMetaColumns } from "@/lib/db/tables/utils"
import { roles, defaultRole } from "@/lib/db/roles"

export const userRole = pgEnum("user_role", roles)

export const users = pgTable("user", {
  ...idColumn,
  username: text("username").notNull().unique(),
  name: text("name"),
  email: text("email"),
  role: userRole("role").notNull().default(defaultRole),
  passwordHash: text("password_hash").notNull(),
  ...timestampMetaColumns,
})
export type UsersTable = typeof users

export const userRelations = relations(users, ({ many }) => ({ posts: many(posts, { relationName: "creator" }) }))

export const schema = { users }
