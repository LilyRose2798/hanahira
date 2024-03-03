import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { maxFileSize, tableSchemas } from "@/lib/db/schemas/utils"
import { UploadsTable } from "@/lib/db/tables/uploads"
import { Post } from "@/lib/db/schemas/posts"

extendZodWithOpenApi(z)

export const {
  schema: uploadSchema,
  partialSchema: partialUploadSchema,
  idSchema: uploadIdSchema,
  queryIdSchema: queryUploadIdSchema,
  querySchema: queryUploadsSchema,
  createSchema: createUploadSchema,
  replaceSchema: replaceUploadSchema,
  updateSchema: updateUploadSchema,
  createdBySchema: uploadsCreatedBySchema,
  updatedBySchema: uploadsUpdatedBySchema,
  defaults: uploadDefaults,
} = tableSchemas<UploadsTable>("upload")({
  id: z.string().openapi({ description: "The upload's ID", example: "jyfW7MDalrr" }),
  location: z.string().openapi({ description: "The upload's location", example: "/uploads/jyfW7MDalrr.png" }),
  originalName: z.string().openapi({ description: "The upload's original file name", example: "shinobu.jpg" }),
  originalExtension: z.string().openapi({ description: "The upload's original file extension", example: "jpg" }).nullable(),
  originalMime: z.string().openapi({ description: "The upload's original mime type", example: "image/jpeg" }).nullable(),
  detectedExtension: z.string().openapi({ description: "The upload's detected extension based on the file's magic numbers", example: "jpg" }).nullable(),
  detectedMime: z.string().openapi({ description: "The upload's detected mime type based on the file's magic numbers", example: "image/jpeg" }).nullable(),
  md5Hash: z.string().openapi({ description: "The upload's MD5 hash", example: "58374e2a084ac0de8c7aa139d4763c94" }),
  sha256Hash: z.string().openapi({ description: "The upload's SHA-256 hash", example: "0d3925437ca45d310fcca150c15bf84687b18f07c35892850fcfe8feb12f0aab" }),
  sha512Hash: z.string().openapi({ description: "The upload's SHA-512 hash", example: "a581565c1014d05ee4833eb572032b73caa066328aaad67f06cbc4b90a52f982453a658704be597e365c0c00e9cb25f0f05c5694316153295843ff9f859be5a3" }),
  blockHash: z.string().openapi({ description: "The upload's perceptual block hash", example: "0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0" }).nullable(),
  width: z.number().int().min(1).max(2 ** 31 - 1).openapi({ description: "The upload's width", example: 1920 }).nullable(),
  height: z.number().int().min(1).max(2 ** 31 - 1).openapi({ description: "The upload's height", example: 1080 }).nullable(),
  size: z.number().int().min(1).max(maxFileSize).openapi({ description: "The upload's file size in bytes", example: 102842 }),
}, {})

export type Upload = z.infer<typeof uploadSchema>
export type UploadWithPost = Upload & { post?: Post }
export type PartialUpload = z.infer<typeof partialUploadSchema>
export type UploadIdParams = z.infer<typeof uploadIdSchema>
export type QueryUploadIdParams = z.infer<typeof queryUploadIdSchema>
export type QueryUploadsParams = z.infer<typeof queryUploadsSchema>
export type CreateUploadParams = z.infer<typeof createUploadSchema>
export type ReplaceUploadParams = z.infer<typeof replaceUploadSchema>
export type UpdateUploadParams = z.infer<typeof updateUploadSchema>
export type UploadsCreatedByParams = z.infer<typeof uploadsCreatedBySchema>
export type UploadsUpdatedByParams = z.infer<typeof uploadsUpdatedBySchema>
