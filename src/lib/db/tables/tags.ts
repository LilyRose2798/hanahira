import { pgTable, primaryKey, text } from "drizzle-orm/pg-core"
import { idColumn, metaColumns, userMetaRelations } from "@/lib/db/tables/utils"
import { postTags } from "@/lib/db/tables/posts"
import { relations } from "drizzle-orm"

export const tagTypes = pgTable("tag_type", {
  ...idColumn,
  name: text("name").notNull(),
  description: text("description"),
  ...metaColumns,
})
export type TagTypesTable = typeof tagTypes

export const tags = pgTable("tag", {
  ...idColumn,
  name: text("name").notNull(),
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

export const tagTypeRelations = relations(tagTypes, ({ one, many }) => ({
  tags: many(tags),
  ...userMetaRelations(tagAliases)({ one }),
}))

export const tagAliasRelations = relations(tagAliases, ({ one }) => ({
  tag: one(tags, { fields: [tagAliases.tagId], references: [tags.id] }),
  ...userMetaRelations(tagAliases)({ one }),
}))

export const tagImplicationRelations = relations(tagImplications, ({ one }) => ({
  tag: one(tags, { fields: [tagImplications.tagId], references: [tags.id], relationName: "tag" }),
  impliesTag: one(tags, { fields: [tagImplications.impliesTagId], references: [tags.id], relationName: "impliesTag" }),
  ...userMetaRelations(tagImplications)({ one }),
}))

export const tagRelations = relations(tags, ({ one, many }) => ({
  type: one(tagTypes, { fields: [tags.typeId], references: [tagTypes.id] }),
  aliases: many(tagAliases),
  impliesTags: many(tagImplications, { relationName: "tag" }),
  impliedByTags: many(tagImplications, { relationName: "impliesTag" }),
  posts: many(postTags),
  ...userMetaRelations(tags)({ one }),
}))
