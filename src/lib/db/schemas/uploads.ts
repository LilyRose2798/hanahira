import { z } from "zod"
import { extendZodWithOpenApi } from "zod-openapi"
import { maxAllowedFileSize, tableSchemas } from "@/lib/db/schemas/utils"
import { UploadsTable } from "@/lib/db/tables/uploads"

extendZodWithOpenApi(z)

export const {
  schema: uploadSchema,
  idSchema: uploadIdSchema,
  createdBySchema: uploadCreatedBySchema,
  updatedBySchema: uploadUpdatedBySchema,
  querySchema: queryUploadSchema,
  createSchema: createUploadSchema,
  replaceSchema: replaceUploadSchema,
  updateSchema: updateUploadSchema,
  defaults: uploadDefaults,
} = tableSchemas<UploadsTable>("upload")({
  id: z.string().openapi({ description: "The upload's ID", example: "jyfW7MDalrr" }),
  location: z.string().openapi({ description: "The upload's location" }),
  originalName: z.string().openapi({ description: "The upload's original file name", example: "shinobu.jpg" }),
  originalExtension: z.string().nullable().openapi({ description: "The upload's original file extension", example: "jpg" }),
  originalMime: z.string().nullable().openapi({ description: "The upload's original mime type", example: "image/jpeg" }),
  detectedExtension: z.string().nullable().openapi({ description: "The upload's detected extension based on the file's magic numbers", example: "jpg" }),
  detectedMime: z.string().nullable().openapi({ description: "The upload's detected mime type based on the file's magic numbers", example: "image/jpeg" }),
  size: z.number().int().min(1).max(maxAllowedFileSize).openapi({ description: "The upload's file size in bytes", example: 102842 }),
  md5Hash: z.string().openapi({ description: "The upload's MD5 hash", example: "58374e2a084ac0de8c7aa139d4763c94" }),
  sha256Hash: z.string().openapi({ description: "The upload's SHA-256 hash", example: "0d3925437ca45d310fcca150c15bf84687b18f07c35892850fcfe8feb12f0aab" }),
  sha512Hash: z.string().openapi({ description: "The upload's SHA-512 hash", example: "a581565c1014d05ee4833eb572032b73caa066328aaad67f06cbc4b90a52f982453a658704be597e365c0c00e9cb25f0f05c5694316153295843ff9f859be5a3" }),
  blockHash: z.string().nullable().openapi({ description: "The upload's perceptual block hash", example: "0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0" }),
}, {})

export type Upload = z.infer<typeof uploadSchema>
export type UploadIdParams = z.infer<typeof uploadIdSchema>
export type UploadCreatedByParams = z.infer<typeof uploadCreatedBySchema>
export type UploadUpdatedByParams = z.infer<typeof uploadUpdatedBySchema>
export type QueryUploadParams = z.infer<typeof queryUploadSchema>
export type CreateUploadParams = z.infer<typeof createUploadSchema>
export type ReplaceUploadParams = z.infer<typeof replaceUploadSchema>
export type UpdateUploadParams = z.infer<typeof updateUploadSchema>
