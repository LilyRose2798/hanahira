import { auth, createSession, setSession } from "@/lib/lucia"
import { Session } from "lucia"
import { SignInParams, SignUpParams } from "@/lib/db/schema/users"
import { TRPCError } from "@trpc/server"
import * as p from "postgres"

export const signIn = async ({ username, password }: SignInParams) => {
  try {
    const { userId } = await auth.useKey("username", username.toLowerCase(), password)
    const session = await createSession(userId)
    setSession(session)
    return session
  } catch (err) {
    if (err instanceof Error && (err.message === "AUTH_INVALID_KEY_ID" || err.message === "AUTH_INVALID_PASSWORD")) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect username or password" })
    else throw err
  }
}

export const signUp = async ({ username, password }: SignUpParams) => {
  try {
    const { userId } = await auth.createUser({
      key: { providerId: "username", providerUserId: username.toLowerCase(), password },
      // eslint-disable-next-line camelcase
      attributes: { username, name: null, email: null, access_level: 1 },
    })
    const session = await createSession(userId)
    setSession(session)
    return session
  } catch (err) {
    if (err instanceof p.default.PostgresError && "code" in err && err.code === "23505") throw new TRPCError({ code: "CONFLICT", message: "Username already taken" })
    else throw err
  }
}

export const signOut = async (session: Session) => {
  await auth.invalidateSession(session.sessionId)
  setSession(null)
  return session
}
