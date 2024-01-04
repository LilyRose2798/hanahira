import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { tableSchemas } from "@/lib/db/schemas/utils"
import { PasswordResetsTable } from "@/lib/db/tables/password-resets"

extendZodWithOpenApi(z)

export const {
  schema: passwordResetSchema,
  partialSchema: partialPasswordResetSchema,
  idSchema: passwordResetIdSchema,
  queryIdSchema: queryPasswordResetIdSchema,
  querySchema: queryPasswordResetsSchema,
  createSchema: createPasswordResetSchema,
  replaceSchema: replacePasswordResetSchema,
  updateSchema: updatePasswordResetSchema,
  createdBySchema: passwordResetsCreatedBySchema,
  updatedBySchema: passwordResetsUpdatedBySchema,
  defaults: passwordResetDefaults,
} = tableSchemas<PasswordResetsTable>("password reset")({
  id: z.string().openapi({ description: "The password reset's ID", example: "jyfW7MDalrr" }),
  expiresAt: z.coerce.date().openapi({ description: "The date the password reset expires", example: new Date(0) }),
}, { expiresAt: true })

export type PasswordReset = z.infer<typeof passwordResetSchema>
export type PartialPasswordReset = z.infer<typeof partialPasswordResetSchema>
export type PasswordResetIdParams = z.infer<typeof passwordResetIdSchema>
export type QueryPasswordResetIdParams = z.infer<typeof queryPasswordResetIdSchema>
export type QueryPasswordResetsParams = z.infer<typeof queryPasswordResetsSchema>
export type CreatePasswordResetParams = z.infer<typeof createPasswordResetSchema>
export type ReplacePasswordResetParams = z.infer<typeof replacePasswordResetSchema>
export type UpdatePasswordResetParams = z.infer<typeof updatePasswordResetSchema>
export type PasswordResetsCreatedByParams = z.infer<typeof passwordResetsCreatedBySchema>
export type PasswordResetsUpdatedByParams = z.infer<typeof passwordResetsUpdatedBySchema>
