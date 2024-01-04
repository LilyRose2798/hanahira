import { CreatePasswordResetParams, QueryPasswordResetIdParams, QueryPasswordResetsParams, ReplacePasswordResetParams, PasswordResetsCreatedByParams, PasswordResetIdParams, PasswordResetsUpdatedByParams, UpdatePasswordResetParams, passwordResetDefaults } from "@/lib/db/schemas/password-resets"
import { QueryCreatedByIdParams, QueryCreatedByUsernameParams, UsernameParams } from "@/lib/db/schemas/users"
import { findUserByUsername } from "@/lib/api/users"
import { db } from "@/lib/db"
import { whereConfig, paginationConfig, sortingConfig, fieldsConfig } from "@/lib/db/utils"
import { parseFound, parseFoundFirst, limit, parseCreated } from "@/lib/api/utils"
import { passwordResets } from "@/lib/db/tables/password-resets"
import { KnownKeysOnly, eq } from "drizzle-orm"

export type FindPasswordResetsParams = NonNullable<Parameters<typeof db.query.passwordResets.findMany>[0]>
export type FindPasswordResetParams = Omit<FindPasswordResetsParams, "limit">

export const findPasswordResets = <T extends FindPasswordResetsParams>(config: KnownKeysOnly<T, FindPasswordResetsParams>) => (
  db.query.passwordResets.findMany({ limit, ...config }).execute().then(parseFound))

export const findPasswordResetById = <T extends PasswordResetIdParams & FindPasswordResetParams>(
  { id, ...config }: KnownKeysOnly<T, PasswordResetIdParams & FindPasswordResetParams>) => db.query.passwordResets
    .findFirst({ where: (passwordResets, { eq }) => eq(passwordResets.id, id), ...config }).execute().then(parseFound)

export const findPasswordResetsCreatedBy = <T extends PasswordResetsCreatedByParams & FindPasswordResetsParams>(
  { createdBy, limit, ...config }: KnownKeysOnly<T, PasswordResetsCreatedByParams & FindPasswordResetsParams>) => (
    db.query.passwordResets.findMany({
      where: (passwordResets, { eq }) => eq(passwordResets.createdBy, createdBy),
      ...config,
    }).execute().then(parseFound))

export const findPasswordResetsCreatedByUsername = <T extends UsernameParams & FindPasswordResetsParams>(
  { username, limit, ...config }: KnownKeysOnly<T, UsernameParams & FindPasswordResetsParams>) => (
    findUserByUsername({ username, columns: { id: true } }).then(({ id: createdBy }) => (
      findPasswordResetsCreatedBy({ createdBy, ...config }))))

export const queryPasswordResets = ({ fields, page, sort, ...passwordReset }: QueryPasswordResetsParams) => (
  db.query.passwordResets.findMany({
    ...whereConfig(passwordReset),
    ...fieldsConfig(passwordResets, fields),
    ...paginationConfig({ page }),
    ...sortingConfig(sort),
  }).execute().then(parseFound))

export const queryPasswordResetById = ({ id, fields }: QueryPasswordResetIdParams) => (
  db.query.passwordResets.findFirst({
    where: (passwordResets, { eq }) => eq(passwordResets.id, id),
    ...fieldsConfig(passwordResets, fields),
  }).execute().then(parseFound))

export const queryPasswordResetsCreatedById = ({ id, fields, page, sort }: QueryCreatedByIdParams) => (
  db.query.passwordResets.findMany({
    where: (passwordResets, { eq }) => eq(passwordResets.createdBy, id),
    ...fieldsConfig(passwordResets, fields),
    ...paginationConfig({ page }),
    ...sortingConfig(sort),
  }).execute().then(parseFound))

export const queryPasswordResetsCreatedByUsername = ({ username, ...config }: QueryCreatedByUsernameParams) => (
  findUserByUsername({ username, columns: { id: true } }).then(({ id }) => queryPasswordResetsCreatedById({ id, ...config })))

export const createPasswordReset = (passwordReset: CreatePasswordResetParams & PasswordResetsCreatedByParams) => (
  db.insert(passwordResets).values({ ...passwordReset, updatedBy: passwordReset.createdBy })
    .returning().execute().then(parseCreated))

export const replacePasswordReset = ({ id, ...passwordReset }:
    ReplacePasswordResetParams & PasswordResetsUpdatedByParams) => (
  db.update(passwordResets).set({ ...passwordResetDefaults, ...passwordReset, updatedAt: new Date() })
    .where(eq(passwordResets.id, id)).returning().execute().then(parseFoundFirst))

export const updatePasswordReset = ({ id, ...passwordReset }:
    UpdatePasswordResetParams & PasswordResetsUpdatedByParams) => (
  db.update(passwordResets).set({ ...passwordReset, updatedAt: new Date() })
    .where(eq(passwordResets.id, id)).returning().execute().then(parseFoundFirst))

export const deletePasswordReset = ({ id }: PasswordResetIdParams) => db.delete(passwordResets)
  .where(eq(passwordResets.id, id)).returning().execute().then(parseFoundFirst)

export const deletePasswordResetsCreatedById = ({ createdBy }: PasswordResetsCreatedByParams) => db.delete(passwordResets)
  .where(eq(passwordResets.createdBy, createdBy)).returning().execute().then(parseFound)
