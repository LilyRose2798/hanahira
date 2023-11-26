import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { tableSchemas } from "@/lib/db/schemas/utils"
import { PostsTable } from "@/lib/db/tables/posts"
import { postRatings } from "@/lib/db/enums/postRating"
import { postStatuses } from "@/lib/db/enums/postStatus"

extendZodWithOpenApi(z)

export const {
  schema: postSchema,
  partialSchema: partialPostSchema,
  idSchema: postIdSchema,
  queryIdSchema: queryPostIdSchema,
  querySchema: queryPostsSchema,
  createSchema: createPostSchema,
  replaceSchema: replacePostSchema,
  updateSchema: updatePostSchema,
  createdBySchema: postsCreatedBySchema,
  updatedBySchema: postsUpdatedBySchema,
  defaults: postDefaults,
} = tableSchemas<PostsTable>("post")({
  id: z.string().openapi({ description: "The post's ID", example: "jyfW7MDalrr" }),
  uploadId: z.string().openapi({ description: "The ID of the upload associated with the post", example: "jyfW7MDalrr" }),
  description: z.string().min(1).max(65536).openapi({ description: "The post's description", example: "A cute picture of Oshino Shinobu lying on a donut pillow." }).nullable(),
  sourceUrl: z.string().url().openapi({ description: "The post's source URL", example: "https://www.pixiv.net/en/artworks/98552071" }).nullable(),
  rating: z.enum(postRatings).openapi({ description: "The post's rating", example: "SAFE" }),
  status: z.enum(postStatuses).openapi({ description: "The post's status", example: "ACTIVE" }),
}, { status: true })

export type Post = z.infer<typeof postSchema>
export type PartialPost = z.infer<typeof partialPostSchema>
export type PostIdParams = z.infer<typeof postIdSchema>
export type QueryPostIdParams = z.infer<typeof queryPostIdSchema>
export type QueryPostsParams = z.infer<typeof queryPostsSchema>
export type CreatePostParams = z.infer<typeof createPostSchema>
export type ReplacePostParams = z.infer<typeof replacePostSchema>
export type UpdatePostParams = z.infer<typeof updatePostSchema>
export type PostsCreatedByParams = z.infer<typeof postsCreatedBySchema>
export type PostsUpdatedByParams = z.infer<typeof postsUpdatedBySchema>
