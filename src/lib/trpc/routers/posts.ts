import { router as r, procedure as p } from "@/lib/trpc"
import { hasAuth, canEditPost } from "@/lib/trpc/middleware"
import { findPosts, queryPosts, queryPostById, createPost, replacePost, updatePost, deletePost, findPostById } from "@/lib/api/posts"
import { postSchema, partialPostSchema, postIdSchema, queryPostIdSchema, queryPostsSchema, createPostSchema, replacePostSchema, updatePostSchema } from "@/lib/db/schemas/posts"

export const tags = ["Posts"]

export const postsRouter = r({
  find: r({
    manyWithUpload: p.query(async () => findPosts({ with: { upload: true }, orderBy: (posts, { desc }) => desc(posts.createdAt) })),
    byIdWithUpload: p.input(postIdSchema).query(async ({ input }) => findPostById({ ...input, with: { upload: true } })),
  }),
  query: r({
    many: p
      .meta({ openapi: {
        method: "GET",
        path: "/posts",
        tags,
        summary: "Query post data",
        description: "Query the data of posts",
        successDescription: "Post data successfully returned",
        errorResponses: {
          400: "Invalid post data",
          500: "Unexpected server error",
        },
      } })
      .input(queryPostsSchema)
      .output(partialPostSchema.array())
      .query(async ({ input }) => queryPosts(input)),
    byId: p
      .meta({ openapi: {
        method: "GET",
        path: "/posts/{id}",
        tags,
        summary: "Query a post's data",
        description: "Query the data of the post with the specified ID",
        successDescription: "Post data successfully returned",
        errorResponses: {
          400: "Invalid post ID",
          404: "Post not found with specified ID",
          500: "Unexpected server error",
        },
      } })
      .input(queryPostIdSchema)
      .output(partialPostSchema)
      .query(async ({ input }) => queryPostById(input)),
  }),
  create: p
    .meta({ openapi: {
      method: "POST",
      path: "/posts",
      tags,
      summary: "Create a post",
      description: "Create a post with the specified data",
      protect: true,
      successDescription: "Post successfully created",
      errorResponses: {
        400: "Invalid post data",
        401: "Not signed in",
        500: "Unexpected server error",
      },
    } })
    .use(hasAuth)
    .input(createPostSchema)
    .output(postSchema)
    .mutation(async ({ input, ctx: { user: { id: createdBy } } }) => (
      createPost({ ...input, createdBy }))),
  replace: p
    .meta({ openapi: {
      method: "PUT",
      path: "/posts/{id}",
      tags,
      summary: "Replace a post's data",
      description: "Replace the data of the post with the specified ID",
      protect: true,
      successDescription: "Post data successfully replaced",
      errorResponses: {
        400: "Invalid post data",
        401: "Not signed in",
        403: "Signed in user does not own post with specified ID",
        404: "Post not found",
        500: "Unexpected server error",
      },
    } })
    .use(hasAuth)
    .input(replacePostSchema)
    .use(canEditPost)
    .output(postSchema)
    .mutation(async ({ input, ctx: { user: { id: updatedBy } } }) => (
      replacePost({ ...input, updatedBy }))),
  update: p
    .meta({ openapi: {
      method: "PATCH",
      path: "/posts/{id}",
      tags,
      summary: "Update a post's data",
      description: "Update the data of the post with the specified ID",
      protect: true,
      successDescription: "Post data successfully updated",
      errorResponses: {
        400: "Invalid post data",
        401: "Not signed in",
        403: "Signed in user does not own post with specified ID",
        404: "Post not found",
        500: "Unexpected server error",
      },
    } })
    .use(hasAuth)
    .input(updatePostSchema)
    .use(canEditPost)
    .output(postSchema)
    .mutation(async ({ input, ctx: { user: { id: updatedBy } } }) => (
      updatePost({ ...input, updatedBy }))),
  delete: p
    .meta({ openapi: {
      method: "DELETE",
      path: "/posts/{id}",
      tags,
      summary: "Delete a post",
      description: "Delete the post with the specified ID",
      protect: true,
      successDescription: "Post successfully Deleted",
      errorResponses: {
        400: "Invalid post ID",
        401: "Not signed in",
        403: "Signed in user does not own post with specified ID",
        404: "Post not found",
        500: "Unexpected server error",
      },
    } })
    .use(hasAuth)
    .input(postIdSchema)
    .use(canEditPost)
    .output(postSchema)
    .mutation(async ({ input }) => deletePost(input)),
})
