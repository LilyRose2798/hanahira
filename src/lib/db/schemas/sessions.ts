import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { tableSchemas } from "@/lib/db/schemas/utils"
import { SessionsTable } from "@/lib/db/tables/sessions"

extendZodWithOpenApi(z)

export const {
  schema: sessionSchema,
  partialSchema: partialSessionSchema,
  idSchema: sessionIdSchema,
  queryIdSchema: querySessionIdSchema,
  querySchema: querySessionsSchema,
  createSchema: createSessionSchema,
  replaceSchema: replaceSessionSchema,
  updateSchema: updateSessionSchema,
  createdBySchema: sessionsCreatedBySchema,
  updatedBySchema: sessionsUpdatedBySchema,
  defaults: sessionDefaults,
} = tableSchemas<SessionsTable>("session")({
  id: z.string().openapi({ description: "The session's ID", example: "jyfW7MDalrr" }),
  expiresAt: z.coerce.date().openapi({ description: "The date the session expires", example: new Date(0) }),
}, { expiresAt: true })

export type Session = z.infer<typeof sessionSchema>
export type PartialSession = z.infer<typeof partialSessionSchema>
export type SessionIdParams = z.infer<typeof sessionIdSchema>
export type QuerySessionIdParams = z.infer<typeof querySessionIdSchema>
export type QuerySessionsParams = z.infer<typeof querySessionsSchema>
export type CreateSessionParams = z.infer<typeof createSessionSchema>
export type ReplaceSessionParams = z.infer<typeof replaceSessionSchema>
export type UpdateSessionParams = z.infer<typeof updateSessionSchema>
export type SessionsCreatedByParams = z.infer<typeof sessionsCreatedBySchema>
export type SessionsUpdatedByParams = z.infer<typeof sessionsUpdatedBySchema>
