import { userSchema } from "@/lib/db/schemas/users"
import { Session } from "lucia"
import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { zodModel } from "@/lib/db/schemas/utils"

extendZodWithOpenApi(z)

export const sessionSchema = zodModel<Session>("session")({
  id: z.string().openapi({ description: "The ID of the session", example: "98uc971praxb19vv18jgyzu5cqlaw7wl7jjjbi4a" }),
  userId: userSchema.shape.id,
  expiresAt: z.date().openapi({ description: "The date the session expires at", example: new Date(0) }),
  fresh: z.boolean().openapi({ description: "Whether the session is fresh", example: true }),
})
