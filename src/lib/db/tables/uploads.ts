import { bigint, integer, pgTable, text } from "drizzle-orm/pg-core"
import { idColumn } from "@/lib/db/tables/utils"
import { metaColumns } from "@/lib/db/tables/users"

export const uploads = pgTable("upload", {
  ...idColumn,
  location: text("location").notNull(),
  originalName: text("original_name").notNull(),
  originalExtension: text("original_extension"),
  originalMime: text("original_mime"),
  detectedExtension: text("detected_extension"),
  detectedMime: text("detected_mime"),
  md5Hash: text("md5_hash").notNull(),
  sha256Hash: text("sha256_hash").notNull(),
  sha512Hash: text("sha512_hash").notNull(),
  blockHash: text("block_hash"),
  width: integer("width"),
  height: integer("height"),
  size: bigint("size", { mode: "number" }).notNull(),
  ...metaColumns,
})
export type UploadsTable = typeof uploads
