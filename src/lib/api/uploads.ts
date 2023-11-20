import { db } from "@/lib/db"
import { whereConfig, paginationConfig, sortingConfig } from "@/lib/db/utils"
import { eq } from "drizzle-orm"
import { uploadDefaults, UploadIdParams, UploadCreatedByParams, UploadUpdatedByParams, CreateUploadParams, ReplaceUploadParams, UpdateUploadParams, QueryUploadParams } from "@/lib/db/schemas/uploads"
import { uploads } from "@/lib/db/tables/uploads"
import { parseFound, parseCreated, parseFoundFirst } from "@/lib/api/utils"
import { UserIdParams, UsernameParams } from "@/lib/db/schemas/users"

export const findUploads = ({ page, sort, ...upload }: QueryUploadParams = {}) => db.query.uploads
  .findMany({ ...whereConfig(upload), ...paginationConfig({ page }), ...sortingConfig(sort) }).execute().then(parseFound)
export const findUploadById = ({ id }: UploadIdParams) => db.query.uploads
  .findFirst({ where: (uploads, { eq }) => eq(uploads.id, id) }).execute().then(parseFound)
export const findUploadsCreatedById = ({ id }: UserIdParams) => db.query.uploads
  .findMany({ where: (uploads, { eq }) => eq(uploads.createdBy, id) }).execute().then(parseFound)
export const findUploadsCreatedByUsername = ({ username }: UsernameParams) => db.query.users
  .findFirst({ with: { createdUploads: true }, where: (users, { eq }) => eq(users.username, username) })
  .execute().then(parseFound).then(x => x.createdUploads)
export const createUpload = (upload: CreateUploadParams & UploadCreatedByParams) => db.insert(uploads)
  .values({ ...upload, updatedBy: upload.createdBy }).returning().execute().then(parseCreated)
export const replaceUpload = ({ id, ...upload }: ReplaceUploadParams & UploadUpdatedByParams) => db.update(uploads)
  .set({ ...uploadDefaults, ...upload, updatedAt: new Date() }).where(eq(uploads.id, id)).returning().execute().then(parseFoundFirst)
export const updateUpload = ({ id, ...upload }: UpdateUploadParams & UploadUpdatedByParams) => db.update(uploads)
  .set({ ...upload, updatedAt: new Date() }).where(eq(uploads.id, id)).returning().execute().then(parseFoundFirst)
export const deleteUpload = ({ id }: UploadIdParams) => db.delete(uploads)
  .where(eq(uploads.id, id)).returning().execute().then(parseFoundFirst)
