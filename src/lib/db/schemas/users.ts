import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { baseTableSchemas, fieldsSchema, baseQuerySchema } from "@/lib/db/schemas/utils"
import { UsersTable } from "@/lib/db/tables/users"
import { userRoles, defaultUserRole } from "@/lib/db/enums/user-role"

extendZodWithOpenApi(z)

export const {
  schema: userSchema,
  partialSchema: partialUserSchema,
  publicSchema: publicUserSchema,
  idSchema: userIdSchema,
  queryIdSchema: queryUserIdSchema,
  querySchema: queryUserSchema,
  publicQuerySchema: publicQueryUserSchema,
  createSchema: createUserSchema,
  replaceSchema: replaceUserSchema,
  updateSchema: updateUserSchema,
  defaults: userDefaults,
} = baseTableSchemas<UsersTable>("user")({
  id: z.string().openapi({ description: "The user's ID", example: "105b7lip5nqptbw" }),
  name: z.string().min(1).max(128).openapi({ description: "The user's display name", example: "Oshino Shinobu" }).nullable(),
  username: z.string().min(1).max(64).regex(/[a-z0-9_-]+/, "username may only contain lowercase letters, numbers, underscores (_), and dashes (-)")
    .openapi({ description: "The user's unique username", example: "oshino_shinobu" }),
  email: z.string().email().max(512).openapi({ description: "The user's email address", example: "shinobu@example.com" }).nullable(),
  emailVerifiedAt: z.date().openapi({ description: "The date the user verified their email address", example: new Date(0) }).nullable(),
  role: z.enum(userRoles).openapi({ description: "The user's role", example: defaultUserRole }),
  passwordHash: z.string().openapi({ description: "The user's password hash", example: "asdf" }),
  otpSecret: z.string().openapi({ description: "The user's OTP secret", example: "RSAG65YKKUPGRZS3P2O22KSTDV5NOO5K" }).nullable(),
}, { role: true }, { id: true, name: true, username: true, role: true, createdAt: true })

export const usernameSchema = userSchema.pick({ username: true })
export const queryUsernameSchema = usernameSchema.extend(fieldsSchema.shape)
export const totpSchema = z.string().min(6).max(6)
  .openapi({ description: "The TOTP code", example: "294817" }).optional()
export const passwordSchema = z.string().min(1).max(256)
  .openapi({ description: "The user's password", example: "hunter2" })
export const signInSchema = z.object({ username: userSchema.shape.username, password: passwordSchema, totp: totpSchema })
  .openapi({ title: "Credentials", description: "The data to sign in to a user account with" })
export const signUpSchema = z.object({ username: userSchema.shape.username, password: passwordSchema })
  .openapi({ title: "Credentials", description: "The data to sign up for a new user account" })

export type Password = z.infer<typeof passwordSchema>
export type SignInParams = z.infer<typeof signInSchema>
export type SignUpParams = z.infer<typeof signUpSchema>

export const queryCreatedByIdSchema = userIdSchema.extend(baseQuerySchema.shape)
export const queryUpdatedByIdSchema = userIdSchema.extend(baseQuerySchema.shape)
export const queryCreatedByUsernameSchema = usernameSchema.extend(baseQuerySchema.shape)
export const queryUpdatedByUsernameSchema = usernameSchema.extend(baseQuerySchema.shape)

export type QueryCreatedByIdParams = z.infer<typeof queryCreatedByIdSchema>
export type QueryUpdatedByIdParams = z.infer<typeof queryUpdatedByIdSchema>
export type QueryCreatedByUsernameParams = z.infer<typeof queryCreatedByUsernameSchema>
export type QueryUpdatedByUsernameParams = z.infer<typeof queryUpdatedByUsernameSchema>

export type User = z.infer<typeof userSchema>
export type PartialUser = z.infer<typeof partialUserSchema>
export type PublicUser = z.infer<typeof publicUserSchema>
export type UserIdParams = z.infer<typeof userIdSchema>
export type UsernameParams = z.infer<typeof usernameSchema>
export type QueryUserIdParams = z.infer<typeof queryUserIdSchema>
export type QueryUsernameParams = z.infer<typeof queryUsernameSchema>
export type QueryUserParams = z.infer<typeof queryUserSchema>
export type PublicQueryUserParams = z.infer<typeof publicQueryUserSchema>
export type CreateUserParams = z.infer<typeof createUserSchema>
export type ReplaceUserParams = z.infer<typeof replaceUserSchema>
export type UpdateUserParams = z.infer<typeof updateUserSchema>
