import { router as r, procedure as p } from "@/lib/trpc"
import { hasAuth, hasRole, canEditUser } from "@/lib/trpc/middleware"
import { invalidateAuthAndReturn } from "@/lib/lucia"
import { userSchema, partialUserSchema, userIdSchema, createUserSchema, replaceUserSchema, updateUserSchema, queryUserSchema, queryUserIdSchema, queryCreatedByIdSchema } from "@/lib/db/schemas/users"
import { partialPostSchema } from "@/lib/db/schemas/posts"
import { queryUsers, queryUserById, createUser, replaceUser, updateUser, deleteUser, findUsers, findUserById } from "@/lib/api/users"
import { findPostsCreatedById, queryPostsCreatedById } from "@/lib/api/posts"
import { partialUploadSchema } from "@/lib/db/schemas/uploads"
import { findUploadsCreatedById, queryUploadsCreatedById } from "@/lib/api/uploads"

export const tags = ["Users"]

export const usersRouter = r({
  find: r({
    many: p.use(hasAuth).use(hasRole("SITE_MODERATOR")).query(async () => findUsers({})),
    byId: p.use(hasAuth).use(hasRole("SITE_MODERATOR")).input(userIdSchema).query(async ({ input }) => findUserById(input)),
    uploads: p.use(hasAuth).use(hasRole("SITE_MODERATOR")).input(userIdSchema).query(async ({ input }) => findUploadsCreatedById(input)),
    posts: p.use(hasAuth).use(hasRole("SITE_MODERATOR")).input(userIdSchema).query(async ({ input }) => findPostsCreatedById(input)),
  }),
  query: r({
    many: p
      .meta({ openapi: {
        method: "GET",
        path: "/users",
        tags,
        summary: "Query user data",
        description: "Query the data of users",
        protect: true,
        successDescription: "User data successfully returned",
        errorResponses: {
          401: "Not signed in",
          500: "Unexpected server error",
        },
      } })
      .use(hasAuth)
      .use(hasRole("SITE_MODERATOR"))
      .input(queryUserSchema)
      .output(partialUserSchema.array())
      .query(async ({ input }) => queryUsers(input)),
    byId: p
      .meta({ openapi: {
        method: "GET",
        path: "/users/{id}",
        tags,
        summary: "Query a user's data",
        description: "Query the data of the user with the specified ID",
        protect: true,
        successDescription: "User data successfully returned",
        errorResponses: {
          400: "Invalid user ID",
          401: "Not signed in",
          404: "User not found with specified ID",
          500: "Unexpected server error",
        },
      } })
      .use(hasAuth)
      .use(hasRole("SITE_MODERATOR"))
      .input(queryUserIdSchema)
      .output(partialUserSchema)
      .query(async ({ input }) => queryUserById(input)),
    uploads: p
      .meta({ openapi: {
        method: "GET",
        path: "/users/{id}/uploads",
        tags,
        summary: "Query a user's uploads",
        description: "Query the data of the uploads created by the user with the specified ID",
        protect: true,
        successDescription: "Upload data successfully returned",
        errorResponses: {
          400: "Invalid user ID",
          401: "Not signed in",
          500: "Unexpected server error",
        },
      } })
      .use(hasAuth)
      .use(hasRole("SITE_MODERATOR"))
      .input(queryCreatedByIdSchema)
      .output(partialUploadSchema.array())
      .query(async ({ input }) => queryUploadsCreatedById(input)),
    posts: p
      .meta({ openapi: {
        method: "GET",
        path: "/users/{id}/posts",
        tags,
        summary: "Query a user's posts",
        description: "Query the data of the posts created by the user with the specified ID",
        protect: true,
        successDescription: "Post data successfully returned",
        errorResponses: {
          400: "Invalid user ID",
          401: "Not signed in",
          500: "Unexpected server error",
        },
      } })
      .use(hasAuth)
      .use(hasRole("SITE_MODERATOR"))
      .input(queryCreatedByIdSchema)
      .output(partialPostSchema.array())
      .query(async ({ input }) => queryPostsCreatedById(input)),
  }),
  create: p
    .meta({ openapi: {
      method: "POST",
      path: "/users",
      tags,
      summary: "Create a user",
      description: "Create a user with the specified data",
      protect: true,
      successDescription: "User successfully created",
      errorResponses: {
        400: "Invalid user data",
        401: "Not signed in",
        403: "Signed in user has insufficient access level",
        500: "Unexpected server error",
      },
    } })
    .use(hasAuth)
    .use(hasRole("SITE_MODERATOR"))
    .input(createUserSchema)
    .output(userSchema)
    .mutation(async ({ input }) => createUser(input)),
  replace: p
    .meta({ openapi: {
      method: "PUT",
      path: "/users/{id}",
      tags,
      summary: "Replace a user's data",
      description: "Replace the data of the user with the specified ID",
      protect: true,
      successDescription: "User data successfully replaced",
      errorResponses: {
        400: "Invalid user data",
        401: "Not signed in",
        403: "Signed in user does not own user with specified ID",
        404: "User not found",
        500: "Unexpected server error",
      },
    } })
    .use(hasAuth)
    .input(replaceUserSchema)
    .use(canEditUser)
    .output(userSchema)
    .mutation(async ({ input }) => replaceUser(input).then(invalidateAuthAndReturn)),
  update: p
    .meta({ openapi: {
      method: "PATCH",
      path: "/users/{id}",
      tags,
      summary: "Update a user's data",
      description: "Update the data of the user with the specified ID",
      protect: true,
      successDescription: "User data successfully updated",
      errorResponses: {
        400: "Invalid user data",
        401: "Not signed in",
        403: "Signed in user does not own user with specified ID",
        404: "User not found",
        500: "Unexpected server error",
      },
    } })
    .use(hasAuth)
    .input(updateUserSchema)
    .use(canEditUser)
    .output(userSchema)
    .mutation(async ({ input }) => updateUser(input).then(invalidateAuthAndReturn)),
  delete: p
    .meta({ openapi: {
      method: "DELETE",
      path: "/users/{id}",
      tags,
      summary: "Delete a user",
      description: "Delete the user with the specified ID",
      protect: true,
      successDescription: "User successfully deleted",
      errorResponses: {
        400: "Invalid user ID",
        401: "Not signed in",
        403: "Signed in user does not own user with specified ID",
        404: "User not found",
        500: "Unexpected server error",
      },
    } })
    .use(hasAuth)
    .input(userIdSchema)
    .use(canEditUser)
    .output(userSchema)
    .mutation(async ({ input }) => deleteUser(input).then(invalidateAuthAndReturn)),
})
