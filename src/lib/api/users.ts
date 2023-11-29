import { db } from "@/lib/db"
import { whereConfig, paginationConfig, sortingConfig, fieldsConfig } from "@/lib/db/utils"
import { KnownKeysOnly, eq } from "drizzle-orm"
import { userDefaults, UserIdParams, UsernameParams, CreateUserParams, UpdateUserParams, QueryUserParams, QueryUsernameParams, QueryUserIdParams } from "@/lib/db/schemas/users"
import { users } from "@/lib/db/tables/users"
import { parseFound, parseCreated, parseFoundFirst, limit } from "@/lib/api/utils"

type FindUsersParams = NonNullable<Parameters<typeof db.query.users.findMany>[0]>
type FindUserParams = Omit<FindUsersParams, "limit">

export const findUsers = <T extends FindUserParams>(config: KnownKeysOnly<T, FindUsersParams>) => db.query.users
  .findMany({ limit, ...config }).execute().then(parseFound)

export const findUserById = <T extends UserIdParams & FindUserParams>(
  { id, ...config }: KnownKeysOnly<T, UserIdParams & FindUserParams>) => db.query.users
    .findFirst({ where: (users, { eq }) => eq(users.id, id), ...config }).execute().then(parseFound)

export const findUserByUsername = <T extends UsernameParams & FindUserParams>(
  { username, ...config }: KnownKeysOnly<T, UsernameParams & FindUserParams>) => db.query.users
    .findFirst({ where: (users, { eq }) => eq(users.username, username), ...config }).execute().then(parseFound)

export const queryUsers = ({ fields, page, sort, ...user }: QueryUserParams) => db.query.users.findMany({
  ...whereConfig(user),
  ...fieldsConfig(users, fields),
  ...paginationConfig({ page }),
  ...sortingConfig(sort),
}).execute().then(parseFound)

export const queryUserById = ({ id, fields }: QueryUserIdParams) => db.query.users.findFirst({
  where: (users, { eq }) => eq(users.id, id),
  ...fieldsConfig(users, fields),
}).execute().then(parseFound)

export const queryUserByUsername = ({ username, fields }: QueryUsernameParams) => db.query.users.findFirst({
  where: (users, { eq }) => eq(users.username, username),
  ...fieldsConfig(users, fields),
}).execute().then(parseFound)

export const createUser = (user: CreateUserParams) => db.insert(users)
  .values(user).returning().execute().then(parseCreated)

export const replaceUser = ({ id, ...user }: UpdateUserParams) => db.update(users)
  .set({ ...userDefaults, ...user, updatedAt: new Date() }).where(eq(users.id, id)).returning().execute().then(parseFoundFirst)

export const updateUser = ({ id, ...user }: UpdateUserParams) => db.update(users)
  .set({ ...user, updatedAt: new Date }).where(eq(users.id, id)).returning().execute().then(parseFoundFirst)

export const deleteUser = ({ id }: UserIdParams) => db.delete(users)
  .where(eq(users.id, id)).returning().execute().then(parseFoundFirst)
