import { relations } from "drizzle-orm"
import { pgTable, text, smallint } from "drizzle-orm/pg-core"
import { Refine, createInsertSchema, createSelectSchema } from "drizzle-zod"
import { ZodSchema, z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { Session } from "lucia"
import { sqlDefault, SQLDefaults } from "@/lib/db/utils"
import { posts } from "@/lib/db/schema/posts"
extendZodWithOpenApi(z)

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name"),
  email: text("email"),
  accessLevel: smallint("access_level").notNull(),
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
  accessLevel: ({ accessLevel }) => accessLevel.min(1).max(100)
    .openapi({ description: "The user's access level", example: 10 }),
} satisfies Refine<typeof users, "select" | "insert">

export const userSchema = createSelectSchema(users, userRefine)
  .openapi({ ref: "User", title: "User", description: "The information for a user" })
export const userIdSchema = userSchema.pick({ id: true })
export const createUserSchema = createInsertSchema(users, userRefine)
  .openapi({ title: "User", description: "The data to create a new user with" })
export const replaceUserSchema = createUserSchema
  .openapi({ title: "User", description: "The data to replace a user's information with" })
export const updateUserSchema = createUserSchema.partial().required({ id: true })
  .openapi({ title: "User", description: "The data to update a user's information with" })
export const passwordSchema = z.string().min(1).max(256)
  .openapi({ description: "The user's password", example: "hunter2" })
export const signInSchema = z.object({ username: userSchema.shape.username, password: passwordSchema })
  .openapi({ title: "Credentials", description: "The data to sign in to a user account with" })
export const signUpSchema = z.object({ username: userSchema.shape.username, password: passwordSchema })
  .openapi({ title: "Credentials", description: "The data to sign up for a new user account" })
export const sessionSchema = z.object({
  sessionId: z.string().openapi({ description: "The ID of the session", example: "98uc971praxb19vv18jgyzu5cqlaw7wl7jjjbi4a" }),
  user: z.object({
    userId: userSchema.shape.id,
    username: userSchema.shape.username,
    name: userSchema.shape.name,
    email: userSchema.shape.email,
    accessLevel: userSchema.shape.accessLevel,
  }),
  activePeriodExpiresAt: z.date().openapi({ description: "The date the session's active period expires at", example: new Date(0) }),
  idlePeriodExpiresAt: z.date().openapi({ description: "The date the session's idle period expires at", example: new Date(0) }),
  state: z.enum(["idle", "active"]).openapi({ description: "Whether the state of the session is idle or active", example: "active" }),
  fresh: z.boolean().openapi({ description: "Whether the session is fresh", example: true }),
}).openapi({ ref: "Session", title: "Session", description: "The information for a user session" }) satisfies ZodSchema<Session>

export type User = z.infer<typeof userSchema>
export type UserIdParams = z.infer<typeof userIdSchema>
export type CreateUserParams = z.infer<typeof createUserSchema>
export type ReplaceUserParams = z.infer<typeof replaceUserSchema>
export type UpdateUserParams = z.infer<typeof updateUserSchema>
export type Password = z.infer<typeof passwordSchema>
export type SignInParams = z.infer<typeof signInSchema>
export type SignUpParams = z.infer<typeof signUpSchema>

export const userDefaults = {
  name: sqlDefault,
  email: sqlDefault,
} satisfies SQLDefaults<ReplaceUserParams>
