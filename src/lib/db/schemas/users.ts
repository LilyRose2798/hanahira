import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { sqlDefault, SQLDefaults } from "@/lib/db/utils"
import { zodModel, Model, paginationSchema, sortingSchema, timestampMetaColumnMask } from "@/lib/db/schemas/utils"
import { UsersTable } from "@/lib/db/tables/users"
import { defaultRole, roles } from "@/lib/db/roles"

extendZodWithOpenApi(z)

export const userSchema = zodModel<Model<UsersTable>>()({
  id: z.string().openapi({ description: "The user's ID", example: "105b7lip5nqptbw" }),
  name: z.string().min(1).max(128).nullable().openapi({ description: "The user's display name", example: "Oshino Shinobu" }),
  username: z.string().min(1).max(64).regex(/[a-z0-9_-]+/, "username may only contain lowercase letters, numbers, underscores (_), and dashes (-)")
    .openapi({ description: "The user's unique username", example: "oshino_shinobu" }),
  email: z.string().email().max(512).nullable().openapi({ description: "The user's email address", example: "shinobu@example.com" }),
  role: z.enum(roles).openapi({ description: "The user's role", example: defaultRole }),
  createdAt: z.date().openapi({ description: "The date the user was created", example: new Date(0) }),
  modifiedAt: z.date().openapi({ description: "The date the user was modified", example: new Date(0) }),
}).openapi({ ref: "User", title: "User", description: "The information for a user" })

export const userIdSchema = userSchema.pick({ id: true })

export const queryUserSchema = userSchema.extend({
  name: userSchema.shape.name.unwrap(),
  email: userSchema.shape.email.unwrap(),
  ...paginationSchema.shape,
  ...sortingSchema.shape,
}).partial().openapi({ title: "User", description: "The data to query users with" })

const insertSchema = userSchema.partial({ name: true, email: true, role: true }).omit(timestampMetaColumnMask)
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
} satisfies SQLDefaults<CreateUserParams>
