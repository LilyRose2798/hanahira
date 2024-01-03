import { CreateSessionParams, QuerySessionIdParams, QuerySessionsParams, ReplaceSessionParams, SessionsCreatedByParams, SessionIdParams, SessionsUpdatedByParams, UpdateSessionParams, sessionDefaults } from "@/lib/db/schemas/sessions"
import { QueryCreatedByIdParams, QueryCreatedByUsernameParams, UsernameParams } from "@/lib/db/schemas/users"
import { findUserByUsername } from "@/lib/api/users"
import { db } from "@/lib/db"
import { whereConfig, paginationConfig, sortingConfig, fieldsConfig } from "@/lib/db/utils"
import { parseFound, parseFoundFirst, limit, parseCreated } from "@/lib/api/utils"
import { sessions } from "@/lib/db/tables/sessions"
import { KnownKeysOnly, eq } from "drizzle-orm"

export type FindSessionsParams = NonNullable<Parameters<typeof db.query.sessions.findMany>[0]>
export type FindSessionParams = Omit<FindSessionsParams, "limit">

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
