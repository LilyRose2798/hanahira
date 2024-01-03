import { router as r, procedure as p } from "@/lib/trpc"
import { hasAuth, hasAuthWithUser } from "@/lib/trpc/middleware"
import { replaceUserSchema, updateUserSchema, userSchema, passwordSchema } from "@/lib/db/schemas/users"
import { replaceUser, updateUser, deleteUser, queryUserById, updateUserPassword } from "@/lib/api/users"
import { z } from "zod"
import { partialUploadSchema, uploadIdSchema } from "@/lib/db/schemas/uploads"
import { baseQuerySchema } from "@/lib/db/schemas/utils"
import { partialPostSchema } from "@/lib/db/schemas/posts"
import { findUploadsByIdsCreatedBy, findUploadsCreatedBy, queryUploadsCreatedById } from "@/lib/api/uploads"
import { findPostsCreatedBy, queryPostsCreatedById } from "@/lib/api/posts"

export const tags = ["Account"]

export const accountRouter = r({
  find: r({
    current: p.use(hasAuthWithUser).query(async ({ ctx: { session: { creator } } }) => creator),
    currentWithSession: p.use(hasAuthWithUser).query(async ({ ctx: { session: { creator, ...session } } }) => ({ ...creator, session })),
    uploads: p.use(hasAuth).query(async ({ ctx: { session: { createdBy } } }) => findUploadsCreatedBy({ createdBy })),
    uploadsByIds: p.use(hasAuth).input(z.object({ ids: uploadIdSchema.shape.id.array() }))
      .query(async ({ input, ctx: { session: { createdBy } } }) => findUploadsByIdsCreatedBy({ ...input, createdBy })),
    posts: p.use(hasAuth).query(async ({ ctx: { session: { createdBy } } }) => findPostsCreatedBy({ createdBy })),
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
      .query(async ({ ctx: { session: { createdBy: id } } }) => queryUserById({ id })),
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
      .query(async ({ input, ctx: { session: { createdBy: id } } }) => queryUploadsCreatedById({ id, ...input })),
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
      .query(async ({ input, ctx: { session: { createdBy: id } } }) => queryPostsCreatedById({ id, ...input })),
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
    .mutation(async ({ input, ctx: { session: { createdBy: id } } }) => (
      replaceUser({ id, ...input }))),
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
    .mutation(async ({ input, ctx: { session: { createdBy: id } } }) => (
      updateUser({ id, ...input }))),
  updatePassword: p
    .use(hasAuth)
    .input(z.object({
      password: passwordSchema,
    }))
    .output(z.void())
    .mutation(async ({ ctx: { session: { createdBy: id } }, input }) => updateUserPassword({ id, ...input })),
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
    .mutation(async ({ ctx: { session: { createdBy: id } } }) => (
      deleteUser({ id }))),
})
