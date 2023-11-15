import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { SQLDefaults, sqlDefault } from "@/lib/db/utils"
import { zodModel, Model, QueryParams, paginationSchema, sortingSchema } from "@/lib/db/schemas/utils"
import { PostsTable } from "@/lib/db/tables/posts"

extendZodWithOpenApi(z)

export const postSchema = zodModel<Model<PostsTable>>()({
  id: z.string().openapi({ description: "The post's ID", example: "jyfW7MDalrr" }),
  description: z.string().min(1).max(65536).openapi({ description: "The post's description", example: "A cute picture of Oshino Shinobu lying on a donut pillow." }).nullable(),
  sourceUrl: z.string().url().openapi({ description: "The post's source URL", example: "https://www.pixiv.net/en/artworks/98552071" }).nullable(),
  createdAt: z.date().openapi({ description: "The date the post was created", example: new Date(0) }),
  modifiedAt: z.date().openapi({ description: "The date the post was last modified", example: new Date(0) }),
  createdBy: z.string().openapi({ description: "The ID of the user the post was created by", example: "105b7lip5nqptbw" }),
  modifiedBy: z.string().openapi({ description: "The ID of the user the post was last modified by", example: "105b7lip5nqptbw" }),
}).openapi({ ref: "Post", title: "Post", description: "The information for a post" })

export const postIdSchema = postSchema.pick({ id: true })

export const queryPostSchema = zodModel<QueryParams<PostsTable>>()(postSchema.extend({
  description: postSchema.shape.description.unwrap().optional(),
  sourceUrl: postSchema.shape.sourceUrl.unwrap().optional(),
  ...paginationSchema.shape,
  ...sortingSchema.shape,
}).partial()).openapi({ title: "Post", description: "The data to query posts with" })

const insertSchema = postSchema.partial({ description: true, sourceUrl: true })
  .omit({ createdBy: true, createdAt: true, modifiedBy: true, modifiedAt: true })
export const createPostSchema = insertSchema.omit({ id: true })
  .openapi({ title: "Post", description: "The data to create a new post with" })
export const replacePostSchema = insertSchema
  .openapi({ title: "Post", description: "The data to replace a post's information with" })
export const updatePostSchema = insertSchema.required().partial().required({ id: true })
  .openapi({ title: "Post", description: "The data to update a post's information with" })

export type Post = z.infer<typeof postSchema>
export type PostIdParams = z.infer<typeof postIdSchema>
export type PostCreatedByParams = Pick<Post, "createdBy">
export type QueryPostParams = z.infer<typeof queryPostSchema>
export type CreatePostParams = z.infer<typeof createPostSchema>
export type ReplacePostParams = z.infer<typeof replacePostSchema>
export type UpdatePostParams = z.infer<typeof updatePostSchema>

export const postDefaults = {
  description: sqlDefault,
  sourceUrl: sqlDefault,
} satisfies SQLDefaults<CreatePostParams>
