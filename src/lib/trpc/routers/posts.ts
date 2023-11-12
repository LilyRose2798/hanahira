import { router as r, procedure as p } from "@/lib/trpc"
import { withAuth, withPostOwnership } from "@/lib/trpc/middleware"
import { nanoid } from "@/lib/db"
import { postIdSchema, createPostSchema, replacePostSchema, updatePostSchema, postSchema } from "@/lib/db/schema/posts"
import { findPosts, findPostById, createPost, replacePost, updatePost, deletePost } from "@/lib/api/posts"
import { z } from "zod"

export const postsRouter = r({
  query: r({
    all: p
      .meta({ openapi: {
        method: "GET",
        path: "/posts",
        tags: ["Posts"],
        summary: "Query all post data",
        description: "Query the data of all posts",
        successDescription: "All post data successfully returned",
        errorResponses: {
          500: "Unexpected server error",
        },
      } })
      .input(z.void())
      .output(postSchema.array())
      .query(async () => findPosts()),
    byId: p
      .meta({ openapi: {
        method: "GET",
        path: "/posts/{id}",
        tags: ["Posts"],
        summary: "Query a post's data",
        description: "Query the data of the post with the specified ID",
        successDescription: "Post data successfully returned",
        errorResponses: {
          400: "Invalid post ID",
          404: "Post not found with specified ID",
          500: "Unexpected server error",
        },
      } })
      .input(postIdSchema)
      .output(postSchema)
      .query(async ({ input: post }) => findPostById(post)),
  }),
  create: p
    .meta({ openapi: {
      method: "POST",
      path: "/posts",
      tags: ["Posts"],
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
    .use(withAuth())
    .input(createPostSchema.omit({ id: true, createdBy: true, createdAt: true }))
    .output(postSchema)
    .mutation(async ({ input: post, ctx: { session: { user: { userId: createdBy } } } }) => (
      createPost({ ...post, id: nanoid(), createdBy }))),
  replace: p
    .meta({ openapi: {
      method: "PUT",
      path: "/posts/{id}",
      tags: ["Posts"],
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
    .use(withAuth())
    .input(replacePostSchema.omit({ createdBy: true, createdAt: true }))
    .use(withPostOwnership(10))
    .output(postSchema)
    .mutation(async ({ input: post, ctx: { session: { user: { userId: createdBy } } } }) => (
      replacePost({ ...post, createdBy }))),
  update: p
    .meta({ openapi: {
      method: "PATCH",
      path: "/posts/{id}",
      tags: ["Posts"],
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
    .use(withAuth())
    .input(updatePostSchema.omit({ createdBy: true, createdAt: true }))
    .use(withPostOwnership(10))
    .output(postSchema)
    .mutation(async ({ input: post, ctx: { session: { user: { userId: createdBy } } } }) => (
      updatePost({ ...post, createdBy }))),
  delete: p
    .meta({ openapi: {
      method: "POST",
      path: "/posts/{id}",
      tags: ["Posts"],
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
    .use(withAuth())
    .input(postIdSchema)
    .use(withPostOwnership(10))
    .output(postSchema)
    .mutation(async ({ input: post }) => deletePost(post)),
})
