import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { baseTableSchemas } from "@/lib/db/schemas/utils"
import { UsersTable } from "@/lib/db/tables/users"
import { userRoles, defaultUserRole } from "@/lib/db/enums/userRole"

extendZodWithOpenApi(z)

export const {
  schema: userSchema,
  publicSchema: publicUserSchema,
  idSchema: userIdSchema,
  querySchema: queryUserSchema,
  publicQuerySchema: publicQueryUserSchema,
  createSchema: createUserSchema,
  replaceSchema: replaceUserSchema,
  updateSchema: updateUserSchema,
  defaults: userDefaults,
} = baseTableSchemas<UsersTable>("user")({
  id: z.string().openapi({ description: "The user's ID", example: "105b7lip5nqptbw" }),
  name: z.string().min(1).max(128).nullable().openapi({ description: "The user's display name", example: "Oshino Shinobu" }),
  username: z.string().min(1).max(64).regex(/[a-z0-9_-]+/, "username may only contain lowercase letters, numbers, underscores (_), and dashes (-)")
    .openapi({ description: "The user's unique username", example: "oshino_shinobu" }),
  email: z.string().email().max(512).nullable().openapi({ description: "The user's email address", example: "shinobu@example.com" }),
  role: z.enum(userRoles).openapi({ description: "The user's role", example: defaultUserRole }),
  passwordHash: z.string().openapi({ description: "The user's password hash", example: "asdf" }),
}, { role: true }, { id: true, name: true, username: true, role: true, createdAt: true })

export const usernameSchema = userSchema.pick({ username: true })
export const passwordSchema = z.string().min(1).max(256)
  .openapi({ description: "The user's password", example: "hunter2" })
export const signInSchema = z.object({ username: userSchema.shape.username, password: passwordSchema })
  .openapi({ title: "Credentials", description: "The data to sign in to a user account with" })
export const signUpSchema = z.object({ username: userSchema.shape.username, password: passwordSchema })
  .openapi({ title: "Credentials", description: "The data to sign up for a new user account" })

export type Password = z.infer<typeof passwordSchema>
export type SignInParams = z.infer<typeof signInSchema>
export type SignUpParams = z.infer<typeof signUpSchema>

export type User = z.infer<typeof userSchema>
export type PublicUser = z.infer<typeof publicUserSchema>
export type UserIdParams = z.infer<typeof userIdSchema>
export type UsernameParams = z.infer<typeof usernameSchema>
export type QueryUserParams = z.infer<typeof queryUserSchema>
export type PublicQueryUserParams = z.infer<typeof publicQueryUserSchema>
export type CreateUserParams = z.infer<typeof createUserSchema>
export type ReplaceUserParams = z.infer<typeof replaceUserSchema>
export type UpdateUserParams = z.infer<typeof updateUserSchema>
