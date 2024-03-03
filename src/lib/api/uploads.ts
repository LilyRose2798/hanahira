import { db } from "@/lib/db"
import { whereConfig, paginationConfig, sortingConfig, fieldsConfig } from "@/lib/db/utils"
import { KnownKeysOnly, eq } from "drizzle-orm"
import { uploadDefaults, UploadIdParams, UploadsCreatedByParams, UploadsUpdatedByParams, CreateUploadParams, ReplaceUploadParams, UpdateUploadParams, QueryUploadsParams, QueryUploadIdParams } from "@/lib/db/schemas/uploads"
import { uploads } from "@/lib/db/tables/uploads"
import { parseFound, parseCreated, parseFoundFirst, limit } from "@/lib/api/utils"
import { UsernameParams, QueryCreatedByIdParams, QueryCreatedByUsernameParams } from "@/lib/db/schemas/users"
import { findUserByUsername } from "@/lib/api/users"
import { cwd } from "process"
import { join, extname } from "path"
import { FileExtension, fileTypeFromBuffer } from "file-type"
import { nanoid } from "nanoid"
import { bmvbhash } from "@/lib/blockhash"
import { createHash } from "crypto"
import { decode as decodeJpeg } from "jpeg-js"
import { PNG } from "pngjs"
import { decode as decodeWebp } from "@jsquash/webp"
import decodeGif from "decode-gif"
import { writeFile, rm } from "fs/promises"

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

const createHashCreator = (algorithm: string) => (buffer: Buffer) => createHash(algorithm, { encoding: "hex" }).update(buffer).digest("hex")
const createMD5Hash = createHashCreator("md5")
const createSHA256Hash = createHashCreator("sha256")
const createSHA512Hash = createHashCreator("sha512")

type DecodedData = Parameters<typeof bmvbhash>[0]
const decoders: Partial<Record<FileExtension, (buffer: Buffer) => DecodedData | Promise<DecodedData>>> = {
  jpg: decodeJpeg,
  png: PNG.sync.read,
  webp: decodeWebp,
  gif: buffer => {
    const { width, height, frames: [{ data }] } = decodeGif(buffer)
    return { width, height, data }
  },
}

export const saveFile = async (file: File) => {
  const { size, name: originalName, type: originalMime } = file
  const originalExtension = extname(originalName).substring(1) || undefined
  const buffer = Buffer.from(await file.arrayBuffer())
  const { ext: detectedExtension, mime: detectedMime } = await fileTypeFromBuffer(buffer) ?? {}
  const filenameId = nanoid(20)
  const filename = detectedExtension ? `${filenameId}.${detectedExtension}` : filenameId
  const location = `/uploads/${filename}`
  const md5Hash = createMD5Hash(buffer)
  const sha256Hash = createSHA256Hash(buffer)
  const sha512Hash = createSHA512Hash(buffer)
  const decoder = detectedExtension && decoders[detectedExtension]
  const decodedData = await decoder?.(buffer)
  const { width, height } = decodedData ?? {}
  const blockHash = decodedData && bmvbhash(decodedData, 12)
  await writeFile(join(cwd(), "public", location), buffer)
  return {
    location,
    originalName,
    originalExtension,
    originalMime,
    detectedExtension,
    detectedMime,
    md5Hash,
    sha256Hash,
    sha512Hash,
    blockHash,
    width,
    height,
    size,
  }
}

export const deleteFile = async (location: string) => rm(join(cwd(), "public", location))
