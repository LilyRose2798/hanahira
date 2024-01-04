import { router as r, procedure as p } from "@/lib/trpc"
import { hasAuth, hasAuthWithUser } from "@/lib/trpc/middleware"
import { passwordSchema, signInSchema, signUpSchema, usernameSchema } from "@/lib/db/schemas/users"
import { sessionSchema } from "@/lib/db/schemas/sessions"
import { emailVerificationIdSchema, emailVerificationSchema } from "@/lib/db/schemas/email-verifications"
import { passwordResetIdSchema, passwordResetSchema } from "@/lib/db/schemas/password-resets"
import { signIn, signUp, signOut, initiateEmailVerification, submitEmailVerification, initiatePasswordReset, submitPasswordReset } from "@/lib/api/auth"
import { z } from "zod"
import { findPasswordResetById } from "@/lib/api/password-resets"

export const tags = ["Auth"]

export const authRouter = r({
  signIn: p
    .meta({ openapi: {
      method: "POST",
      path: "/sign-in",
      tags,
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
    .mutation(async ({ input }) => signIn(input)),
  signUp: p
    .meta({ openapi: {
      method: "POST",
      path: "/sign-up",
      tags,
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
    .mutation(async ({ input }) => signUp(input)),
  signOut: p
    .meta({ openapi: {
      method: "POST",
      path: "/sign-out",
      tags,
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
  initiateEmailVerification: p
    .use(hasAuthWithUser)
    .input(z.void())
    .output(emailVerificationSchema)
    .mutation(async ({ ctx: { session: { creator } } }) => initiateEmailVerification(creator)),
  submitEmailVerification: p
    .input(emailVerificationIdSchema)
    .output(z.void())
    .mutation(async ({ input }) => submitEmailVerification(input)),
  initiatePasswordReset: p
    .input(usernameSchema)
    .output(passwordResetSchema)
    .mutation(async ({ input }) => initiatePasswordReset(input)),
  findPasswordResetById: p
    .input(passwordResetIdSchema)
    .output(passwordResetSchema)
    .query(async ({ input }) => findPasswordResetById(input)),
  submitPasswordReset: p
    .input(passwordResetIdSchema.extend({ password: passwordSchema }))
    .output(z.void())
    .mutation(async ({ input }) => submitPasswordReset(input)),
})
