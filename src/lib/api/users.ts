import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { users, userDefaults, UserIdParams, CreateUserParams, UpdateUserParams } from "@/lib/db/schema/users"
import { parseFound, parseCreated, parseFoundFirst } from "@/lib/api/utils"
import { generateRandomString } from "lucia/utils"

const findUsersP = db.query.users.findMany().prepare("find_users")
export const findUsers = () => findUsersP.execute()
const findUserByIdP = db.query.users.findFirst({ where: (users, { eq, sql }) => eq(users.id, sql.placeholder("id")) }).prepare("find_user_by_id")
export const findUserById = ({ id }: UserIdParams) => findUserByIdP.execute({ id }).then(parseFound)
export const createUser = (user: CreateUserParams) => db.insert(users)
  .values({ ...user, id: generateRandomString(15) }).returning().execute().then(parseCreated)
export const replaceUser = ({ id, ...user }: UpdateUserParams) => db.update(users)
  .set({ ...userDefaults, ...user }).where(eq(users.id, id)).returning().execute().then(parseFoundFirst)
export const updateUser = ({ id, ...user }: UpdateUserParams) => db.update(users)
  .set(user).where(eq(users.id, id)).returning().execute().then(parseFoundFirst)
export const deleteUser = ({ id }: UserIdParams) => db.delete(users)
  .where(eq(users.id, id)).returning().execute().then(parseFoundFirst)
