import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { tableSchemas } from "@/lib/db/schemas/utils"
import { EmailVerificationsTable } from "@/lib/db/tables/email-verifications"

extendZodWithOpenApi(z)

export const {
  schema: emailVerificationSchema,
  partialSchema: partialEmailVerificationSchema,
  idSchema: emailVerificationIdSchema,
  queryIdSchema: queryEmailVerificationIdSchema,
  querySchema: queryEmailVerificationsSchema,
  createSchema: createEmailVerificationSchema,
  replaceSchema: replaceEmailVerificationSchema,
  updateSchema: updateEmailVerificationSchema,
  createdBySchema: emailVerificationsCreatedBySchema,
  updatedBySchema: emailVerificationsUpdatedBySchema,
  defaults: emailVerificationDefaults,
} = tableSchemas<EmailVerificationsTable>("email verification")({
  id: z.string().openapi({ description: "The email verification's ID", example: "jyfW7MDalrr" }),
  email: z.string().email().max(512).openapi({ description: "The email address being verified", example: "shinobu@example.com" }),
  expiresAt: z.coerce.date().openapi({ description: "The date the email verification expires", example: new Date(0) }),
}, { expiresAt: true })

export type EmailVerification = z.infer<typeof emailVerificationSchema>
export type PartialEmailVerification = z.infer<typeof partialEmailVerificationSchema>
export type EmailVerificationIdParams = z.infer<typeof emailVerificationIdSchema>
export type QueryEmailVerificationIdParams = z.infer<typeof queryEmailVerificationIdSchema>
export type QueryEmailVerificationsParams = z.infer<typeof queryEmailVerificationsSchema>
export type CreateEmailVerificationParams = z.infer<typeof createEmailVerificationSchema>
export type ReplaceEmailVerificationParams = z.infer<typeof replaceEmailVerificationSchema>
export type UpdateEmailVerificationParams = z.infer<typeof updateEmailVerificationSchema>
export type EmailVerificationsCreatedByParams = z.infer<typeof emailVerificationsCreatedBySchema>
export type EmailVerificationsUpdatedByParams = z.infer<typeof emailVerificationsUpdatedBySchema>
