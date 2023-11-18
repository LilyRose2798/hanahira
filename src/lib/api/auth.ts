import { auth, getAuthRequest } from "@/lib/lucia"
import { Session } from "lucia"
import { SignInParams, SignUpParams } from "@/lib/db/schemas/users"
import { createUser, findUserByUsername } from "@/lib/api/users"
import { TRPCError } from "@trpc/server"
import * as p from "postgres"
import { verify, hash } from "argon2"

export const signIn = async ({ username, password }: SignInParams) => {
  const user = await findUserByUsername({ username })
  const validPassword = await verify(user.passwordHash, password)
  if (!validPassword) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect username or password" })
  const session = await auth.createSession(user.id, {})
  getAuthRequest("POST").setSessionCookie(session.id)
  return session
}

export const signUp = async ({ username, password }: SignUpParams) => {
  try {
    const passwordHash = await hash(password)
    const user = await createUser({ username, passwordHash })
    const session = await auth.createSession(user.id, {})
    getAuthRequest("POST").setSessionCookie(session.id)
    return session
  } catch (err) {
    if (err instanceof p.default.PostgresError && "code" in err && err.code === "23505") throw new TRPCError({ code: "CONFLICT", message: "Username already taken" })
    else throw err
  }
}

export const signOut = async (session: Session) => {
  await auth.invalidateSession(session.id)
  getAuthRequest("POST").deleteSessionCookie()
  return session
}
