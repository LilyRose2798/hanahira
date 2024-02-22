import { pgTable, primaryKey, text } from "drizzle-orm/pg-core"
import { idColumn } from "@/lib/db/tables/utils"
import { metaColumns } from "@/lib/db/tables/users"

export const tagTypes = pgTable("tag_type", {
  ...idColumn,
  name: text("name").notNull().unique(),
  description: text("description"),
  colorCode: text("color_code"),
  ...metaColumns,
})
export type TagTypesTable = typeof tagTypes

export const tags = pgTable("tag", {
  ...idColumn,
  name: text("name").notNull().unique(),
  description: text("description"),
  typeId: text("type_id").notNull().references(() => tagTypes.id),
  ...metaColumns,
})
export type TagsTable = typeof tags

export const tagAliases = pgTable("tag_alias", {
  tagId: text("tag_id").notNull().references(() => tags.id),
  name: text("name").notNull().unique(),
  ...metaColumns,
}, table => ({ pk: primaryKey({ columns: [table.tagId, table.name] }) }))
export type TagAliasesTable = typeof tagAliases

export const tagImplications = pgTable("tag_implication", {
  tagId: text("tag_id").notNull().references(() => tags.id),
  impliesTagId: text("implies_tag_id").notNull().references(() => tags.id),
  ...metaColumns,
}, table => ({ pk: primaryKey({ columns: [table.tagId, table.impliesTagId] }) }))
export type TagImplicationsTable = typeof tagImplications
