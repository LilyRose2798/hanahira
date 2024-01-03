import { CreateEmailVerificationParams, QueryEmailVerificationIdParams, QueryEmailVerificationsParams, ReplaceEmailVerificationParams, EmailVerificationsCreatedByParams, EmailVerificationIdParams, EmailVerificationsUpdatedByParams, UpdateEmailVerificationParams, emailVerificationDefaults } from "@/lib/db/schemas/email-verifications"
import { QueryCreatedByIdParams, QueryCreatedByUsernameParams, UsernameParams } from "@/lib/db/schemas/users"
import { findUserByUsername } from "@/lib/api/users"
import { db } from "@/lib/db"
import { whereConfig, paginationConfig, sortingConfig, fieldsConfig } from "@/lib/db/utils"
import { parseFound, parseFoundFirst, limit, parseCreated } from "@/lib/api/utils"
import { emailVerifications } from "@/lib/db/tables/email-verifications"
import { KnownKeysOnly, eq } from "drizzle-orm"

export type FindEmailVerificationsParams = NonNullable<Parameters<typeof db.query.emailVerifications.findMany>[0]>
export type FindEmailVerificationParams = Omit<FindEmailVerificationsParams, "limit">

export const findEmailVerifications = <T extends FindEmailVerificationsParams>(config: KnownKeysOnly<T, FindEmailVerificationsParams>) => (
  db.query.emailVerifications.findMany({ limit, ...config }).execute().then(parseFound))

export const findEmailVerificationById = <T extends EmailVerificationIdParams & FindEmailVerificationParams>(
  { id, ...config }: KnownKeysOnly<T, EmailVerificationIdParams & FindEmailVerificationParams>) => db.query.emailVerifications
    .findFirst({ where: (emailVerifications, { eq }) => eq(emailVerifications.id, id), ...config }).execute().then(parseFound)

export const findEmailVerificationsCreatedBy = <T extends EmailVerificationsCreatedByParams & FindEmailVerificationsParams>(
  { createdBy, limit, ...config }: KnownKeysOnly<T, EmailVerificationsCreatedByParams & FindEmailVerificationsParams>) => (
    db.query.emailVerifications.findMany({
      where: (emailVerifications, { eq }) => eq(emailVerifications.createdBy, createdBy),
      ...config,
    }).execute().then(parseFound))

export const findEmailVerificationsCreatedByUsername = <T extends UsernameParams & FindEmailVerificationsParams>(
  { username, limit, ...config }: KnownKeysOnly<T, UsernameParams & FindEmailVerificationsParams>) => (
    findUserByUsername({ username, columns: { id: true } }).then(({ id: createdBy }) => (
      findEmailVerificationsCreatedBy({ createdBy, ...config }))))

export const queryEmailVerifications = ({ fields, page, sort, ...emailVerification }: QueryEmailVerificationsParams) => (
  db.query.emailVerifications.findMany({
    ...whereConfig(emailVerification),
    ...fieldsConfig(emailVerifications, fields),
    ...paginationConfig({ page }),
    ...sortingConfig(sort),
  }).execute().then(parseFound))

export const queryEmailVerificationById = ({ id, fields }: QueryEmailVerificationIdParams) => (
  db.query.emailVerifications.findFirst({
    where: (emailVerifications, { eq }) => eq(emailVerifications.id, id),
    ...fieldsConfig(emailVerifications, fields),
  }).execute().then(parseFound))

export const queryEmailVerificationsCreatedById = ({ id, fields, page, sort }: QueryCreatedByIdParams) => (
  db.query.emailVerifications.findMany({
    where: (emailVerifications, { eq }) => eq(emailVerifications.createdBy, id),
    ...fieldsConfig(emailVerifications, fields),
    ...paginationConfig({ page }),
    ...sortingConfig(sort),
  }).execute().then(parseFound))

export const queryEmailVerificationsCreatedByUsername = ({ username, ...config }: QueryCreatedByUsernameParams) => (
  findUserByUsername({ username, columns: { id: true } }).then(({ id }) => queryEmailVerificationsCreatedById({ id, ...config })))

export const createEmailVerification = (emailVerification: CreateEmailVerificationParams & EmailVerificationsCreatedByParams) => (
  db.insert(emailVerifications).values({ ...emailVerification, updatedBy: emailVerification.createdBy })
    .returning().execute().then(parseCreated))

export const replaceEmailVerification = ({ id, ...emailVerification }:
    ReplaceEmailVerificationParams & EmailVerificationsUpdatedByParams) => (
  db.update(emailVerifications).set({ ...emailVerificationDefaults, ...emailVerification, updatedAt: new Date() })
    .where(eq(emailVerifications.id, id)).returning().execute().then(parseFoundFirst))

export const updateEmailVerification = ({ id, ...emailVerification }:
    UpdateEmailVerificationParams & EmailVerificationsUpdatedByParams) => (
  db.update(emailVerifications).set({ ...emailVerification, updatedAt: new Date() })
    .where(eq(emailVerifications.id, id)).returning().execute().then(parseFoundFirst))

export const deleteEmailVerification = ({ id }: EmailVerificationIdParams) => db.delete(emailVerifications)
  .where(eq(emailVerifications.id, id)).returning().execute().then(parseFoundFirst)

export const deleteEmailVerificationsCreatedById = ({ createdBy }: EmailVerificationsCreatedByParams) => db.delete(emailVerifications)
  .where(eq(emailVerifications.createdBy, createdBy)).returning().execute().then(parseFound)
