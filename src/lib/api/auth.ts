import { Session } from "@/lib/db/schemas/sessions"
import { SignInParams, SignUpParams, User } from "@/lib/db/schemas/users"
import { createUser, findUserByUsername, updateUser } from "@/lib/api/users"
import { headers, cookies } from "next/headers"
import { TRPCError } from "@trpc/server"
import * as p from "postgres"
import { db } from "@/lib/db"
import { env } from "@/lib/env.mjs"
import { sessionExpiresInSeconds, sessionExpiresInMillis } from "@/lib/db/tables/sessions"
import { hash, verify } from "argon2"
import { KnownKeysOnly } from "drizzle-orm"
import { FindSessionParams, createSession, deleteSession, findSessionById, replaceSession } from "@/lib/api/sessions"
import { createEmailVerification, deleteEmailVerification, deleteEmailVerificationsCreatedById, findEmailVerificationById } from "@/lib/api/email-verifications"
import { EmailVerificationIdParams } from "@/lib/db/schemas/email-verifications"
import { sendMail } from "@/lib/mail"

export const cookieName = "session"

const setSessionCookie = (sessionId: Session["id"] | null) => cookies().set({
  name: cookieName,
  value: sessionId ?? "",
  maxAge: sessionId === null ? 0 : sessionExpiresInSeconds,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
})

export const verifyRequestOrigin = () => {
  try {
    const header = headers()
    const origin = header.get("Origin")
    const host = header.get("Host")
    if (!origin || !host) return false
    return new URL(origin).host === new URL(host.startsWith("http://") || host.startsWith("https://") ? host : `https://${host}`).host
  } catch (_) {
    return false
  }
}

export type WithSessionParams = Pick<FindSessionParams, "with">
export const validateAuth = async <T extends { verifyOrigin: boolean } & WithSessionParams>({ verifyOrigin, with: _with }:
  KnownKeysOnly<T, { verifyOrigin: boolean } & WithSessionParams>): ReturnType<typeof findSessionById<{ id: string } & T>> => {
  const cookie = cookies().get(cookieName)
  const id = cookie ? cookie.value : headers().get("Authorization")?.match(/^Bearer (.*)$/)?.[1]
  if (!id) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not signed in" })
  if (cookie && verifyOrigin && !verifyRequestOrigin()) throw new TRPCError({ code: "FORBIDDEN", message: "Cross-site request detected" })
  const session = await db.query.sessions.findFirst({ where: (sessions, { eq }) => eq(sessions.id, id), with: _with })
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Session not found" })
  const now = Date.now()
  const expiresAt = session.expiresAt.getTime()
  if (now >= expiresAt) {
    setSessionCookie(null)
    await deleteSession({ id })
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Session has expired" })
  }
  if (now >= expiresAt - sessionExpiresInMillis / 2) await replaceSession({ id, updatedBy: session.updatedBy })
  return session
}

export const signIn = async ({ username, password }: SignInParams) => {
  const user = await findUserByUsername({ username })
  const validPassword = await verify(user.passwordHash, password)
  if (!validPassword) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect username or password" })
  const session = await createSession({ createdBy: user.id })
  setSessionCookie(session.id)
  return session
}

export const signUp = async ({ username, password }: SignUpParams) => {
  try {
    const passwordHash = await hash(password)
    const user = await createUser({ username, passwordHash })
    const session = await createSession({ createdBy: user.id })
    setSessionCookie(session.id)
    return session
  } catch (err) {
    if (err instanceof p.default.PostgresError && "code" in err && err.code === "23505") throw new TRPCError({ code: "CONFLICT", message: "Username already taken" })
    else throw err
  }
}

export const signOut = async (session: Session) => {
  await deleteSession({ id: session.id })
  setSessionCookie(null)
  return session
}

export const initiateEmailVerification = async ({ id: createdBy, username, email }: User) => {
  if (email === null) throw new TRPCError({ code: "BAD_REQUEST", message: "User does not have an email address set" })
  await deleteEmailVerificationsCreatedById({ createdBy })
  const emailVerification = await createEmailVerification({ createdBy, email })
  const verificationUrl = new URL(`/verify/${emailVerification.id}`, env.BASE_URL)
  await sendMail({
    to: email,
    subject: "Hanahira Email Verification",
    html: `Click the link below to confirm the email address for the user <i>${username}</i> at Hanahira:<br><br>${verificationUrl}`,
  })
  return emailVerification
}

export const submitEmailVerification = async ({ id }: EmailVerificationIdParams) => {
  const emailVerification = await findEmailVerificationById({ id, with: { creator: true } })
  const now = Date.now()
  const expiresAt = emailVerification.expiresAt.getTime()
  if (now >= expiresAt) {
    await deleteEmailVerification({ id })
    throw new TRPCError({ code: "BAD_REQUEST", message: "Email verification has expired" })
  }
  if (emailVerification.creator.email !== emailVerification.email) {
    await deleteEmailVerification({ id })
    throw new TRPCError({ code: "BAD_REQUEST", message: "Email verification is for a different email than is currently set" })
  }
  await updateUser({ id: emailVerification.createdBy, emailVerifiedAt: new Date(now) })
  await deleteEmailVerification({ id })
}
