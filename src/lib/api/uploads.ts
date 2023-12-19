import { db } from "@/lib/db"
import { whereConfig, paginationConfig, sortingConfig, fieldsConfig } from "@/lib/db/utils"
import { KnownKeysOnly, eq } from "drizzle-orm"
import { uploadDefaults, UploadIdParams, UploadsCreatedByParams, UploadsUpdatedByParams, CreateUploadParams, ReplaceUploadParams, UpdateUploadParams, QueryUploadsParams, QueryUploadIdParams } from "@/lib/db/schemas/uploads"
import { uploads } from "@/lib/db/tables/uploads"
import { parseFound, parseCreated, parseFoundFirst, limit } from "@/lib/api/utils"
import { UsernameParams, QueryCreatedByIdParams, QueryCreatedByUsernameParams } from "@/lib/db/schemas/users"
import { findUserByUsername } from "@/lib/api/users"

type FindUploadsParams = NonNullable<Parameters<typeof db.query.uploads.findMany>[0]>
type FindUploadParams = Omit<FindUploadsParams, "limit">

export const findUploads = <T extends FindUploadsParams>(config: KnownKeysOnly<T, FindUploadsParams>) => db.query.uploads
  .findMany({ limit, ...config }).execute().then(parseFound)

export const findUploadById = <T extends UploadIdParams & FindUploadParams>(
  { id, ...config }: KnownKeysOnly<T, UploadIdParams & FindUploadParams>) => db.query.uploads
    .findFirst({ where: (uploads, { eq }) => eq(uploads.id, id), ...config }).execute().then(parseFound)

export const findUploadsByIdsCreatedBy = <T extends { ids: UploadIdParams["id"][] } & UploadsCreatedByParams & FindUploadsParams>(
  { ids, createdBy, limit, ...config }: KnownKeysOnly<T, { ids: UploadIdParams["id"][] } & UploadsCreatedByParams & FindUploadsParams>) => (ids.length > 0 ? db.query.uploads.findMany({
    where: (uploads, { and, eq, inArray }) => and(eq(uploads.createdBy, createdBy), inArray(uploads.id, ids)),
    ...config,
  }).execute().then(parseFound) : Promise.resolve([]))
export const findUploadsCreatedBy = <T extends UploadsCreatedByParams & FindUploadsParams>(
  { createdBy, limit, ...config }: KnownKeysOnly<T, UploadsCreatedByParams & FindUploadsParams>) => db.query.uploads
    .findMany({ where: (uploads, { eq }) => eq(uploads.createdBy, createdBy), ...config }).execute().then(parseFound)

export const findUploadsCreatedByUsername = <T extends UsernameParams & FindUploadsParams>(
  { username, limit, ...config }: KnownKeysOnly<T, UsernameParams & FindUploadsParams>) => (
    findUserByUsername({ username, columns: { id: true } }).then(({ id: createdBy }) => findUploadsCreatedBy({ createdBy, ...config })))

export const queryUploads = ({ fields, page, sort, ...upload }: QueryUploadsParams) => db.query.uploads.findMany({
  ...whereConfig(upload),
  ...fieldsConfig(uploads, fields),
  ...paginationConfig({ page }),
  ...sortingConfig(sort),
}).execute().then(parseFound)

export const queryUploadById = ({ id, fields }: QueryUploadIdParams) => db.query.uploads.findFirst({
  where: (uploads, { eq }) => eq(uploads.id, id),
  ...fieldsConfig(uploads, fields),
}).execute().then(parseFound)

export const queryUploadsCreatedById = ({ id, fields, page, sort }: QueryCreatedByIdParams) => db.query.uploads.findMany({
  where: (uploads, { eq }) => eq(uploads.createdBy, id),
  ...fieldsConfig(uploads, fields),
  ...paginationConfig({ page }),
  ...sortingConfig(sort),
}).execute().then(parseFound)

export const queryUploadsCreatedByUsername = ({ username, ...config }: QueryCreatedByUsernameParams) => (
  findUserByUsername({ username, columns: { id: true } }).then(({ id }) => queryUploadsCreatedById({ id, ...config })))

export const createUpload = (upload: CreateUploadParams & UploadsCreatedByParams) => db.insert(uploads)
  .values({ ...upload, updatedBy: upload.createdBy }).returning().execute().then(parseCreated)

export const replaceUpload = ({ id, ...upload }: ReplaceUploadParams & UploadsUpdatedByParams) => db.update(uploads)
  .set({ ...uploadDefaults, ...upload, updatedAt: new Date() }).where(eq(uploads.id, id)).returning().execute().then(parseFoundFirst)

export const updateUpload = ({ id, ...upload }: UpdateUploadParams & UploadsUpdatedByParams) => db.update(uploads)
  .set({ ...upload, updatedAt: new Date() }).where(eq(uploads.id, id)).returning().execute().then(parseFoundFirst)

export const deleteUpload = ({ id }: UploadIdParams) => db.delete(uploads)
  .where(eq(uploads.id, id)).returning().execute().then(parseFoundFirst)
