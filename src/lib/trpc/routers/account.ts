import { router as r, procedure as p } from "@/lib/trpc"
import { hasAuth } from "@/lib/trpc/middleware"
import { replaceUserSchema, updateUserSchema, userSchema } from "@/lib/db/schemas/users"
import { findUserById, replaceUser, updateUser, deleteUser, queryUserById } from "@/lib/api/users"
import { z } from "zod"
import { invalidateAuthAndReturn } from "@/lib/lucia"
import { partialUploadSchema, uploadIdSchema } from "@/lib/db/schemas/uploads"
import { baseQuerySchema } from "@/lib/db/schemas/utils"
import { partialPostSchema } from "@/lib/db/schemas/posts"
import { findUploadsByIdsCreatedBy, findUploadsCreatedBy, queryUploadsCreatedById } from "@/lib/api/uploads"
import { findPostsCreatedBy, queryPostsCreatedById } from "@/lib/api/posts"

export const tags = ["Account"]

export const accountRouter = r({
  find: r({
    current: p.use(hasAuth).query(async ({ ctx: { user: { id } } }) => findUserById({ id })),
    uploads: p.use(hasAuth).query(async ({ ctx: { user: { id: createdBy } } }) => findUploadsCreatedBy({ createdBy })),
    uploadsByIds: p.use(hasAuth).input(z.object({ ids: uploadIdSchema.shape.id.array() }))
      .query(async ({ input, ctx: { user: { id: createdBy } } }) => findUploadsByIdsCreatedBy({ ...input, createdBy })),
    posts: p.use(hasAuth).query(async ({ ctx: { user: { id: createdBy } } }) => findPostsCreatedBy({ createdBy })),
  }),
  query: r({
    current: p
      .meta({ openapi: {
        method: "GET",
        path: "/account",
        tags,
        summary: "Query account data",
        description: "Query the user data for the currently signed in account",
        protect: true,
        successDescription: "Account data successfully returned",
        errorResponses: {
          401: "Not signed in",
          404: "Account not found",
          500: "Unexpected server error",
        },
      } })
      .use(hasAuth)
      .input(z.void())
      .output(userSchema)
      .query(async ({ ctx: { user: { id } } }) => queryUserById({ id })),
    uploads: p
      .meta({ openapi: {
        method: "GET",
        path: "/account/uploads",
        tags,
        summary: "Query account uploads",
        description: "Query the data of the uploads created by the currently signed in account",
        protect: true,
        successDescription: "Upload data successfully returned",
        errorResponses: {
          400: "Invalid user ID",
          401: "Not signed in",
          500: "Unexpected server error",
        },
      } })
      .use(hasAuth)
      .input(baseQuerySchema)
      .output(partialUploadSchema.array())
      .query(async ({ input, ctx: { user: { id } } }) => queryUploadsCreatedById({ id, ...input })),
    posts: p
      .meta({ openapi: {
        method: "GET",
        path: "/account/posts",
        tags,
        summary: "Query account posts",
        description: "Query the data of the posts created by the currently signed in account",
        protect: true,
        successDescription: "Post data successfully returned",
        errorResponses: {
          400: "Invalid user ID",
          401: "Not signed in",
          500: "Unexpected server error",
        },
      } })
      .use(hasAuth)
      .input(baseQuerySchema)
      .output(partialPostSchema.array())
      .query(async ({ input, ctx: { user: { id } } }) => queryPostsCreatedById({ id, ...input })),
  }),
  replace: p
    .meta({ openapi: {
      method: "PUT",
      path: "/account",
      tags,
      summary: "Replace account data",
      description: "Replace the user data for the currently signed in account",
      protect: true,
      successDescription: "Account data successfully replaced",
      errorResponses: {
        400: "Invalid account data",
        401: "Not signed in",
        404: "Account not found",
        500: "Unexpected server error",
      },
    } })
    .use(hasAuth)
    .input(replaceUserSchema.omit({ id: true }))
    .output(userSchema)
    .mutation(async ({ input, ctx: { user: { id } } }) => (
      replaceUser({ id, ...input }).then(invalidateAuthAndReturn))),
  update: p
    .meta({ openapi: {
      method: "PATCH",
      path: "/account",
      tags,
      summary: "Update account data",
      description: "Update the user data for the currently signed in account",
      protect: true,
      successDescription: "Account data successfully updated",
      errorResponses: {
        400: "Invalid account data",
        401: "Not signed in",
        404: "Account not found",
        500: "Unexpected server error",
      },
    } })
    .use(hasAuth)
    .input(updateUserSchema.omit({ id: true }))
    .output(userSchema)
    .mutation(async ({ input, ctx: { user: { id } } }) => (
      updateUser({ id, ...input }).then(invalidateAuthAndReturn))),
  delete: p
    .meta({ openapi: {
      method: "DELETE",
      path: "/account",
      tags,
      summary: "Delete an account",
      description: "Delete the user for the currently signed in account",
      protect: true,
      successDescription: "Account successfully deleted",
      errorResponses: {
        401: "Not signed in",
        404: "Account not found",
        500: "Unexpected server error",
      },
    } })
    .use(hasAuth)
    .input(z.void())
    .output(userSchema)
    .mutation(async ({ ctx: { user: { id } } }) => (
      deleteUser({ id }).then(invalidateAuthAndReturn))),
})
