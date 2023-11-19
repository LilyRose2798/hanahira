import { pgTable, text } from "drizzle-orm/pg-core"
import { idColumn, metaColumns, userMetaRelations } from "@/lib/db/tables/utils"

export const posts = pgTable("post", {
  ...idColumn,
  description: text("description"),
  sourceUrl: text("source_url"),
  ...metaColumns,
})
export type PostsTable = typeof posts

export const postRelations = userMetaRelations(posts)
