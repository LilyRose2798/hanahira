import { db } from "@/lib/db"
import { whereConfig, paginationConfig, sortingConfig } from "@/lib/db/utils"
import { eq } from "drizzle-orm"
import { userDefaults, UserIdParams, CreateUserParams, UpdateUserParams, QueryUserParams, UsernameParams } from "@/lib/db/schemas/users"
import { users } from "@/lib/db/tables/users"
import { parseFound, parseCreated, parseFoundFirst } from "@/lib/api/utils"
import { generateId } from "lucia"

export const findUsers = ({ page, sort, ...user }: QueryUserParams = {}) => db.query.users
  .findMany({ ...whereConfig(user), ...paginationConfig({ page }), ...sortingConfig(sort) }).execute()
export const findUserById = ({ id }: UserIdParams) => db.query.users
  .findFirst({ where: (users, { eq }) => eq(users.id, id) }).execute().then(parseFound)
export const findUserByUsername = ({ username }: UsernameParams) => db.query.users
  .findFirst({ where: (users, { eq }) => eq(users.username, username) }).execute().then(parseFound)
export const createUser = (user: CreateUserParams) => db.insert(users)
  .values({ ...user, id: generateId(15) }).returning().execute().then(parseCreated)
export const replaceUser = ({ id, ...user }: UpdateUserParams) => db.update(users)
  .set({ ...userDefaults, ...user, modifiedAt: new Date() }).where(eq(users.id, id)).returning().execute().then(parseFoundFirst)
export const updateUser = ({ id, ...user }: UpdateUserParams) => db.update(users)
  .set({ ...user, modifiedAt: new Date }).where(eq(users.id, id)).returning().execute().then(parseFoundFirst)
export const deleteUser = ({ id }: UserIdParams) => db.delete(users)
  .where(eq(users.id, id)).returning().execute().then(parseFoundFirst)
