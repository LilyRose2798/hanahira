import { CreateSessionParams, QuerySessionIdParams, QuerySessionsParams, ReplaceSessionParams, Session, SessionsCreatedByParams, SessionIdParams, SessionsUpdatedByParams, UpdateSessionParams, sessionDefaults } from "@/lib/db/schemas/sessions"
import { QueryCreatedByIdParams, QueryCreatedByUsernameParams, SignInParams, SignUpParams, UsernameParams } from "@/lib/db/schemas/users"
import { createUser, findUserByUsername } from "@/lib/api/users"
import { headers, cookies } from "next/headers"
import { TRPCError } from "@trpc/server"
import * as p from "postgres"
import { db } from "@/lib/db"
import { whereConfig, paginationConfig, sortingConfig, fieldsConfig } from "@/lib/db/utils"
import { env } from "@/lib/env.mjs"
import { parseFound, parseFoundFirst, limit, parseCreated } from "@/lib/api/utils"
import { sessions, sessionExpiresInSeconds, sessionExpiresInMillis } from "@/lib/db/tables/sessions"
import { hash, verify } from "argon2"
import { KnownKeysOnly, eq } from "drizzle-orm"

type FindSessionsParams = NonNullable<Parameters<typeof db.query.sessions.findMany>[0]>
type FindSessionParams = Omit<FindSessionsParams, "limit">

export const findSessions = <T extends FindSessionsParams>(config: KnownKeysOnly<T, FindSessionsParams>) => db.query.sessions
  .findMany({ limit, ...config }).execute().then(parseFound)

export const findSessionById = <T extends SessionIdParams & FindSessionParams>(
  { id, ...config }: KnownKeysOnly<T, SessionIdParams & FindSessionParams>) => db.query.sessions
    .findFirst({ where: (sessions, { eq }) => eq(sessions.id, id), ...config }).execute().then(parseFound)

export const findSessionsCreatedBy = <T extends SessionsCreatedByParams & FindSessionsParams>(
  { createdBy, limit, ...config }: KnownKeysOnly<T, SessionsCreatedByParams & FindSessionsParams>) => db.query.sessions
    .findMany({ where: (sessions, { eq }) => eq(sessions.createdBy, createdBy), ...config }).execute().then(parseFound)

export const findSessionsCreatedByUsername = <T extends UsernameParams & FindSessionsParams>(
  { username, limit, ...config }: KnownKeysOnly<T, UsernameParams & FindSessionsParams>) => (
    findUserByUsername({ username, columns: { id: true } }).then(({ id: createdBy }) => findSessionsCreatedBy({ createdBy, ...config })))

export const querySessions = ({ fields, page, sort, ...session }: QuerySessionsParams) => db.query.sessions.findMany({
  ...whereConfig(session),
  ...fieldsConfig(sessions, fields),
  ...paginationConfig({ page }),
  ...sortingConfig(sort),
}).execute().then(parseFound)

export const querySessionById = ({ id, fields }: QuerySessionIdParams) => db.query.sessions.findFirst({
  where: (sessions, { eq }) => eq(sessions.id, id),
  ...fieldsConfig(sessions, fields),
}).execute().then(parseFound)

export const querySessionsCreatedById = ({ id, fields, page, sort }: QueryCreatedByIdParams) => db.query.sessions.findMany({
  where: (sessions, { eq }) => eq(sessions.createdBy, id),
  ...fieldsConfig(sessions, fields),
  ...paginationConfig({ page }),
  ...sortingConfig(sort),
}).execute().then(parseFound)

export const querySessionsCreatedByUsername = ({ username, ...config }: QueryCreatedByUsernameParams) => (
  findUserByUsername({ username, columns: { id: true } }).then(({ id }) => querySessionsCreatedById({ id, ...config })))

export const createSession = (session: CreateSessionParams & SessionsCreatedByParams) => db.insert(sessions)
  .values({ ...session, updatedBy: session.createdBy }).returning().execute().then(parseCreated)

export const replaceSession = ({ id, ...session }: ReplaceSessionParams & SessionsUpdatedByParams) => db.update(sessions)
  .set({ ...sessionDefaults, ...session, updatedAt: new Date() }).where(eq(sessions.id, id)).returning().execute().then(parseFoundFirst)

export const updateSession = ({ id, ...session }: UpdateSessionParams & SessionsUpdatedByParams) => db.update(sessions)
  .set({ ...session, updatedAt: new Date() }).where(eq(sessions.id, id)).returning().execute().then(parseFoundFirst)

export const deleteSession = ({ id }: SessionIdParams) => db.delete(sessions)
  .where(eq(sessions.id, id)).returning().execute().then(parseFoundFirst)

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
