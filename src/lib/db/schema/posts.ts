import { relations } from "drizzle-orm"
import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { Refine, createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { users } from "@/lib/db/schema/users"
import { SQLDefaults, sqlDefault } from "@/lib/db/utils"

extendZodWithOpenApi(z)

export const posts = pgTable("post", {
  id: text("id").primaryKey(),
  description: text("description"),
  sourceUrl: text("source_url"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
})

export const postsRelations = relations(posts, ({ one }) => ({
  creator: one(users, { fields: [posts.createdBy], references: [users.id] }),
}))

const postRefine = {
  id: ({ id }) => id
    .openapi({ description: "The post's ID", example: "jyfW7MDalrr" }),
  description: ({ description }) => description.min(1).max(65536)
    .openapi({ description: "The post's description", example: "A cute picture of Oshino Shinobu lying on a donut pillow." }),
  sourceUrl: ({ sourceUrl }) => sourceUrl.url()
    .openapi({ description: "The post's source URL", example: "https://www.pixiv.net/en/artworks/98552071" }),
  createdBy: ({ createdBy }) => createdBy
    .openapi({ description: "The ID of the user the post was created by", example: "105b7lip5nqptbw" }),
  createdAt: ({ createdAt }) => createdAt
    .openapi({ description: "The date the post was created", example: new Date(0) }),
} satisfies Refine<typeof posts, "select" | "insert">

export const postSchema = createSelectSchema(posts, postRefine)
  .openapi({ ref: "Post", title: "Post", description: "The information for a post" })
export const postIdSchema = postSchema.pick({ id: true })
const insertSchema = createInsertSchema(posts, postRefine).omit({ createdBy: true, createdAt: true })
export const createPostSchema = insertSchema.omit({ id: true })
  .openapi({ title: "Post", description: "The data to create a new post with" })
export const replacePostSchema = insertSchema
  .openapi({ title: "Post", description: "The data to replace a post's information with" })
export const updatePostSchema = insertSchema.required().partial().required({ id: true })
  .openapi({ title: "Post", description: "The data to update a post's information with" })

export type Post = z.infer<typeof postSchema>
export type PostIdParams = z.infer<typeof postIdSchema>
export type PostCreatedByParams = Pick<Post, "createdBy">
export type CreatePostParams = z.infer<typeof createPostSchema>
export type ReplacePostParams = z.infer<typeof replacePostSchema>
export type UpdatePostParams = z.infer<typeof updatePostSchema>

export const postDefaults = {
  description: sqlDefault,
  sourceUrl: sqlDefault,
} satisfies SQLDefaults<ReplacePostParams>
