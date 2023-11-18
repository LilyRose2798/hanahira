import { userSchema } from "@/lib/db/schemas/users"
import { Session } from "lucia"
import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { zodModel } from "@/lib/db/schemas/utils"

extendZodWithOpenApi(z)

export const sessionSchema = zodModel<Session>("session")({
  sessionId: z.string().openapi({ description: "The ID of the session", example: "98uc971praxb19vv18jgyzu5cqlaw7wl7jjjbi4a" }),
  user: z.object({
    userId: userSchema.shape.id,
    username: userSchema.shape.username,
    name: userSchema.shape.name,
    email: userSchema.shape.email,
    role: userSchema.shape.role,
  }).openapi({ description: "The data of the user the session belongs to" }),
  activePeriodExpiresAt: z.date().openapi({ description: "The date the session's active period expires at", example: new Date(0) }),
  idlePeriodExpiresAt: z.date().openapi({ description: "The date the session's idle period expires at", example: new Date(0) }),
  state: z.enum(["idle", "active"]).openapi({ description: "Whether the state of the session is idle or active", example: "active" }),
  fresh: z.boolean().openapi({ description: "Whether the session is fresh", example: true }),
})
