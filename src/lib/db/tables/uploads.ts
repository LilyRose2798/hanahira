import { bigint, pgTable, text } from "drizzle-orm/pg-core"
import { idColumn, metaColumns, userMetaRelations } from "@/lib/db/tables/utils"
import { posts } from "@/lib/db/tables/posts"
import { relations } from "drizzle-orm"

export const uploads = pgTable("upload", {
  ...idColumn,
  url: text("url").notNull(),
  originalName: text("original_name").notNull(),
  originalExtension: text("original_extension"),
  originalMime: text("original_mime"),
  detectedExtension: text("detected_extension"),
  detectedMime: text("detected_mime"),
  size: bigint("size", { mode: "number" }).notNull(),
  md5Hash: text("md5_hash").notNull(),
  sha256Hash: text("sha256_hash").notNull(),
  sha512Hash: text("sha512_hash").notNull(),
  blockHash: text("block_hash"),
  ...metaColumns,
})
export type UploadsTable = typeof uploads

export const uploadRelations = relations(uploads, ({ one, many }) => ({
  posts: many(posts),
  ...userMetaRelations(uploads)({ one }),
}))
