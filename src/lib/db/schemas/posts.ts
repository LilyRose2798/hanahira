import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { SQLDefaults, sqlDefault } from "@/lib/db/utils"
import { zodModel, Model, paginationSchema, sortingSchema, QueryParams, CreateParams, ReplaceParams, UpdateParams } from "@/lib/db/schemas/utils"
import { PostsTable } from "@/lib/db/tables/posts"

extendZodWithOpenApi(z)

export type Post = Model<PostsTable>
export type PostIdParams = Pick<Post, "id">
export type PostCreatedByParams = Pick<Post, "createdBy">
export type QueryPostParams = QueryParams<PostsTable>
export type CreatePostParams = CreateParams<PostsTable>
export type ReplacePostParams = ReplaceParams<PostsTable>
export type UpdatePostParams = UpdateParams<PostsTable>

export const postSchema = zodModel<Post>()({
  id: z.string().openapi({ description: "The post's ID", example: "jyfW7MDalrr" }),
  description: z.string().min(1).max(65536).openapi({ description: "The post's description", example: "A cute picture of Oshino Shinobu lying on a donut pillow." }).nullable(),
  sourceUrl: z.string().url().openapi({ description: "The post's source URL", example: "https://www.pixiv.net/en/artworks/98552071" }).nullable(),
  createdAt: z.date().openapi({ description: "The date the post was created", example: new Date(0) }),
  modifiedAt: z.date().openapi({ description: "The date the post was last modified", example: new Date(0) }),
  createdBy: z.string().openapi({ description: "The ID of the user the post was created by", example: "105b7lip5nqptbw" }),
  modifiedBy: z.string().openapi({ description: "The ID of the user the post was last modified by", example: "105b7lip5nqptbw" }),
}).openapi({ ref: "Post", title: "Post", description: "The information for a post" })

export const postIdSchema = postSchema.pick({ id: true })

export const queryPostSchema = zodModel<QueryPostParams>()(postSchema.extend({
  description: postSchema.shape.description.unwrap().optional(),
  sourceUrl: postSchema.shape.sourceUrl.unwrap().optional(),
  ...paginationSchema.shape,
  ...sortingSchema.shape,
}).partial()).openapi({ title: "Post", description: "The data to query posts with" })

const insertSchema = postSchema.partial({ description: true, sourceUrl: true })
  .omit({ createdBy: true, createdAt: true, modifiedBy: true, modifiedAt: true })

export const createPostSchema = zodModel<CreatePostParams>()(insertSchema.omit({ id: true }))
  .openapi({ title: "Post", description: "The data to create a new post with" })
export const replacePostSchema = zodModel<ReplacePostParams>()(insertSchema)
  .openapi({ title: "Post", description: "The data to replace a post's information with" })
export const updatePostSchema = zodModel<UpdatePostParams>()(insertSchema.required().partial().required({ id: true }))
  .openapi({ title: "Post", description: "The data to update a post's information with" })

export const postDefaults = {
  description: sqlDefault,
  sourceUrl: sqlDefault,
} satisfies SQLDefaults<CreatePostParams>
