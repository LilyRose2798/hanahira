import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { tableSchemas } from "@/lib/db/schemas/utils"
import { PostsTable } from "@/lib/db/tables/posts"

extendZodWithOpenApi(z)

export const {
  schema: postSchema,
  publicSchema: publicPostSchema,
  privateSchema: privatePostSchema,
  idSchema: postIdSchema,
  createdBySchema: postCreatedBySchema,
  modifiedBySchema: postModifiedBySchema,
  querySchema: queryPostSchema,
  createSchema: createPostSchema,
  replaceSchema: replacePostSchema,
  updateSchema: updatePostSchema,
  defaults: postDefaults,
} = tableSchemas<PostsTable>("post")({
  id: z.string().openapi({ description: "The post's ID", example: "jyfW7MDalrr" }),
  description: z.string().min(1).max(65536).openapi({ description: "The post's description", example: "A cute picture of Oshino Shinobu lying on a donut pillow." }).nullable(),
  sourceUrl: z.string().url().openapi({ description: "The post's source URL", example: "https://www.pixiv.net/en/artworks/98552071" }).nullable(),
}, {})

export type Post = z.infer<typeof postSchema>
export type PublicPost = z.infer<typeof publicPostSchema>
export type PrivatePost = z.infer<typeof privatePostSchema>
export type PostIdParams = z.infer<typeof postIdSchema>
export type PostCreatedByParams = z.infer<typeof postCreatedBySchema>
export type PostModifiedByParams = z.infer<typeof postModifiedBySchema>
export type QueryPostParams = z.infer<typeof queryPostSchema>
export type CreatePostParams = z.infer<typeof createPostSchema>
export type ReplacePostParams = z.infer<typeof replacePostSchema>
export type UpdatePostParams = z.infer<typeof updatePostSchema>
