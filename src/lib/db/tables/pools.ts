import { integer, pgTable, primaryKey, text, uniqueIndex } from "drizzle-orm/pg-core"
import { idColumn } from "@/lib/db/tables/utils"
import { metaColumns } from "@/lib/db/tables/users"
import { posts } from "@/lib/db/tables/posts"

export const pools = pgTable("pool", {
  ...idColumn,
  name: text("name").notNull(),
  description: text("description"),
  originalTitle: text("original_title"),
  sourceUrl: text("source_url"),
  ...metaColumns,
})
export type PoolsTable = typeof pools

export const poolPosts = pgTable("pool_post", {
  poolId: text("pool_id").notNull().references(() => pools.id),
  postId: text("post_id").notNull().references(() => posts.id),
  index: integer("index").notNull(),
  ...metaColumns,
}, table => ({
  pk: primaryKey({ columns: [table.poolId, table.postId] }),
  poolIdIndexIdx: uniqueIndex().on(table.poolId, table.index),
}))
export type PoolPostsTable = typeof poolPosts
