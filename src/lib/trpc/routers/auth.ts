import { procedure as p } from "@/lib/trpc"
import { hasAuth } from "@/lib/trpc/middleware"
import { signInSchema, signUpSchema } from "@/lib/db/schemas/users"
import { sessionSchema } from "@/lib/db/schemas/sessions"
import { signIn, signUp, signOut } from "@/lib/api/auth"
import { z } from "zod"

export const authProcedures = {
  signIn: p
    .meta({ openapi: {
      method: "POST",
      path: "/sign-in",
      tags: ["Auth"],
      summary: "Sign in to an account",
      description: "Sign in to an existing user account using a username and password",
      successDescription: "Signed in successfully",
      errorResponses: {
        400: "Incorrect username or password",
        500: "Unexpected server error",
      },
    } })
    .input(signInSchema)
    .output(sessionSchema)
    .mutation(async ({ input: creds }) => signIn(creds)),
  signUp: p
    .meta({ openapi: {
      method: "POST",
      path: "/sign-up",
      tags: ["Auth"],
      summary: "Sign up for an account",
      description: "Sign up for a new user account with a username and password",
      successDescription: "Signed up successfully",
      errorResponses: {
        400: "Invalid username or password",
        409: "Username already taken",
        500: "Unexpected server error",
      },
    } })
    .input(signUpSchema)
    .output(sessionSchema)
    .mutation(async ({ input: creds }) => signUp(creds)),
  signOut: p
    .meta({ openapi: {
      method: "POST",
      path: "/sign-out",
      tags: ["Auth"],
      summary: "Sign out of an account",
      description: "Sign out of the currently signed in user account",
      protect: true,
      successDescription: "Signed out successfully",
      errorResponses: {
        401: "Not signed in",
        500: "Unexpected server error",
      },
    } })
    .use(hasAuth)
    .input(z.void())
    .output(sessionSchema)
    .mutation(async ({ ctx: { session } }) => signOut(session)),
}
