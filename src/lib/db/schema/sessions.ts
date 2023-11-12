import { pgTable, text, bigint } from "drizzle-orm/pg-core"
import { users, userSchema } from "@/lib/db/schema/users"
import { Session } from "lucia"
import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"

extendZodWithOpenApi(z)

export const sessions = pgTable("user_session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  activeExpires: bigint("active_expires", { mode: "number" }).notNull(),
  idleExpires: bigint("idle_expires", { mode: "number" }).notNull(),
})

export const sessionSchema = z.object({
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
}).openapi({ ref: "Session", title: "Session", description: "The information for a user session" }) satisfies z.ZodSchema<Session>
