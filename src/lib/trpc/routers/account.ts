import { router as r, procedure as p } from "@/lib/trpc"
import { withAuth } from "@/lib/trpc/middleware"
import { replaceUserSchema, updateUserSchema, userSchema } from "@/lib/db/schema/users"
import { findUserById, replaceUser, updateUser, deleteUser } from "@/lib/api/users"
import { z } from "zod"
import { invalidateAuthAndReturn } from "@/lib/lucia"

export const accountRouter = r({
  query: p
    .meta({ openapi: {
      method: "GET",
      path: "/account",
      tags: ["Account"],
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
    .use(withAuth)
    .input(z.void())
    .output(userSchema)
    .query(async ({ ctx: { session: { user: { userId: id } } } }) => findUserById({ id })),
  replace: p
    .meta({ openapi: {
      method: "PUT",
      path: "/account",
      tags: ["Account"],
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
    .use(withAuth)
    .input(replaceUserSchema.omit({ id: true }))
    .output(userSchema)
    .mutation(async ({ input: user, ctx: { session: { user: { userId: id } } } }) => (
      replaceUser({ id, ...user }).then(invalidateAuthAndReturn))),
  update: p
    .meta({ openapi: {
      method: "PATCH",
      path: "/account",
      tags: ["Account"],
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
    .use(withAuth)
    .input(updateUserSchema.omit({ id: true }))
    .output(userSchema)
    .mutation(async ({ input: user, ctx: { session: { user: { userId: id } } } }) => (
      updateUser({ id, ...user }).then(invalidateAuthAndReturn))),
  delete: p
    .meta({ openapi: {
      method: "DELETE",
      path: "/account",
      tags: ["Account"],
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
    .use(withAuth)
    .input(z.void())
    .output(userSchema)
    .mutation(async ({ ctx: { session: { user: { userId: id } } } }) => (
      deleteUser({ id }).then(invalidateAuthAndReturn))),
})
