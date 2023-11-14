import { relations } from "drizzle-orm"
import { pgTable, text, pgEnum, timestamp } from "drizzle-orm/pg-core"
import { Refine, createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { sqlDefault, SQLDefaults } from "@/lib/db/utils"
import { posts } from "@/lib/db/schema/posts"
import { paginationSchema, sortingSchema } from "@/lib/db/schema/utils"

extendZodWithOpenApi(z)

export const roles = ["User", "Tag Editor", "Post Editor", "Content Moderator", "Site Moderator", "Admin"] as const
export type Role = typeof roles[number]
export const defaultRole = "User" satisfies Role
export const hasRole = (currentRole: Role, requiredRole: Role): boolean => (
  currentRole === requiredRole || roles.indexOf(requiredRole) <= roles.indexOf(currentRole))

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name"),
  email: text("email"),
  role: pgEnum("user_role", roles)("role").notNull().default(defaultRole),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
})

export const usersRelations = relations(users, ({ many }) => ({ posts: many(posts) }))

const userRefine = {
  id: ({ id }) => id
    .openapi({ description: "The user's ID", example: "105b7lip5nqptbw" }),
  name: ({ name }) => name.min(1).max(128)
    .openapi({ description: "The user's display name", example: "Oshino Shinobu" }),
  username: ({ username }) => username.min(1).max(64)
    .regex(/[a-z0-9_-]+/, "username may only contain lowercase letters, numbers, underscores (_), and dashes (-)")
    .openapi({ description: "The user's unique username", example: "oshino_shinobu" }),
  email: ({ email }) => email.email().max(512)
    .openapi({ description: "The user's email address", example: "shinobu@example.com" }),
  role: ({ role }) => role
    .openapi({ description: "The user's role", example: defaultRole }),
  createdAt: ({ createdAt }) => createdAt
    .openapi({ description: "The date the post was created", example: new Date(0) }),
} satisfies Refine<typeof users, "select" | "insert">

export const userSchema = createSelectSchema(users, userRefine)
  .openapi({ ref: "User", title: "User", description: "The information for a user" })
export const userIdSchema = userSchema.pick({ id: true })
export const queryUserSchema = userSchema.extend({
  name: userSchema.shape.name.unwrap(),
  email: userSchema.shape.email.unwrap(),
  ...paginationSchema.shape,
  ...sortingSchema.shape,
}).partial().openapi({ title: "User", description: "The data to query users with" })
const insertSchema = createInsertSchema(users, userRefine)
export const createUserSchema = insertSchema.omit({ id: true })
  .openapi({ title: "User", description: "The data to create a new user with" })
export const replaceUserSchema = insertSchema
  .openapi({ title: "User", description: "The data to replace a user's information with" })
export const updateUserSchema = insertSchema.required().partial().required({ id: true })
  .openapi({ title: "User", description: "The data to update a user's information with" })
export const passwordSchema = z.string().min(1).max(256)
  .openapi({ description: "The user's password", example: "hunter2" })
export const signInSchema = z.object({ username: userSchema.shape.username, password: passwordSchema })
  .openapi({ title: "Credentials", description: "The data to sign in to a user account with" })
export const signUpSchema = z.object({ username: userSchema.shape.username, password: passwordSchema })
  .openapi({ title: "Credentials", description: "The data to sign up for a new user account" })

export type User = z.infer<typeof userSchema>
export type UserIdParams = z.infer<typeof userIdSchema>
export type QueryUserParams = z.infer<typeof queryUserSchema>
export type CreateUserParams = z.infer<typeof createUserSchema>
export type ReplaceUserParams = z.infer<typeof replaceUserSchema>
export type UpdateUserParams = z.infer<typeof updateUserSchema>
export type Password = z.infer<typeof passwordSchema>
export type SignInParams = z.infer<typeof signInSchema>
export type SignUpParams = z.infer<typeof signUpSchema>

export const userDefaults = {
  name: sqlDefault,
  email: sqlDefault,
  role: sqlDefault,
  createdAt: sqlDefault,
} satisfies SQLDefaults<ReplaceUserParams>
