import { pgTable, text } from "drizzle-orm/pg-core"
import { metaColumns, userMetaRelations } from "@/lib/db/tables/utils"
import nanoid from "@/lib/db/nanoid"

export const posts = pgTable("post", {
  id: text("id").primaryKey().$defaultFn(nanoid),
  description: text("description"),
  sourceUrl: text("source_url"),
  ...metaColumns,
})
export type PostsTable = typeof posts

export const postRelations = userMetaRelations(posts)
