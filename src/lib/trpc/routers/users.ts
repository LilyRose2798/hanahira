import { router as r, procedure as p } from "@/lib/trpc"
import { withAuth, withAccess, withUserOwnership } from "@/lib/trpc/middleware"
import { userIdSchema, createUserSchema, replaceUserSchema, updateUserSchema, userSchema } from "@/lib/db/schema/users"
import { findUsers, findUserById, createUser, replaceUser, updateUser, deleteUser } from "@/lib/api/users"
import { z } from "zod"
import { invalidateAuthAndReturn } from "@/lib/lucia"

export const usersRouter = r({
  query: r({
    all: p
      .meta({ openapi: {
        method: "GET",
        path: "/users",
        tags: ["Users"],
        summary: "Query all user data",
        description: "Query the data of all users",
        protect: true,
        successDescription: "All user data successfully returned",
        errorResponses: {
          401: "Not signed in",
          500: "Unexpected server error",
        },
      } })
      .use(withAuth)
      .input(z.void())
      .output(userSchema.array())
      .query(async () => findUsers()),
    byId: p
      .meta({ openapi: {
        method: "GET",
        path: "/users/{id}",
        tags: ["Users"],
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
      .use(withAuth)
      .input(userIdSchema)
      .output(userSchema)
      .query(async ({ input: user }) => findUserById(user)),
  }),
  create: p
    .meta({ openapi: {
      method: "POST",
      path: "/users",
      tags: ["Users"],
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
    .use(withAuth)
    .use(withAccess(10))
    .input(createUserSchema)
    .output(userSchema)
    .mutation(async ({ input: user }) => createUser(user)),
  replace: p
    .meta({ openapi: {
      method: "PUT",
      path: "/users/{id}",
      tags: ["Users"],
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
    .use(withAuth)
    .input(replaceUserSchema)
    .use(withUserOwnership(10))
    .output(userSchema)
    .mutation(async ({ input: user }) => replaceUser(user).then(invalidateAuthAndReturn)),
  update: p
    .meta({ openapi: {
      method: "PATCH",
      path: "/users/{id}",
      tags: ["Users"],
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
    .use(withAuth)
    .input(updateUserSchema)
    .use(withUserOwnership(10))
    .output(userSchema)
    .mutation(async ({ input: user }) => updateUser(user).then(invalidateAuthAndReturn)),
  delete: p
    .meta({ openapi: {
      method: "DELETE",
      path: "/users/{id}",
      tags: ["Users"],
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
    .use(withAuth)
    .input(userIdSchema)
    .use(withUserOwnership(10))
    .output(userSchema)
    .mutation(async ({ input: user }) => deleteUser(user).then(invalidateAuthAndReturn)),
})
