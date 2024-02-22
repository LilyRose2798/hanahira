import { pgTable, primaryKey, text } from "drizzle-orm/pg-core"
import { idColumn } from "@/lib/db/tables/utils"
import { metaColumns } from "@/lib/db/tables/users"
import { tags } from "@/lib/db/tables/tags"

export const artists = pgTable("artist", {
  ...idColumn,
  name: text("name").notNull().unique(),
  ...metaColumns,
})
export type ArtistsTable = typeof artists

export const artistAliases = pgTable("artist_alias", {
  artistId: text("artist_id").notNull().references(() => artists.id),
  name: text("name").notNull().unique(),
  ...metaColumns,
}, table => ({ pk: primaryKey({ columns: [table.artistId, table.name] }) }))
export type ArtistAliasesTable = typeof artistAliases

export const artistLinks = pgTable("artist_link", {
  ...idColumn,
  artistId: text("artist_id").notNull().references(() => artists.id),
  name: text("name").notNull(),
  url: text("url").notNull(),
  ...metaColumns,
})
export type ArtistLinksTable = typeof artistLinks

export const artistTags = pgTable("artist_tag", {
  artistId: text("artist_id").notNull().references(() => artists.id).unique(),
  tagId: text("tag_id").notNull().references(() => tags.id).unique(),
  ...metaColumns,
}, table => ({ pk: primaryKey({ columns: [table.artistId, table.tagId] }) }))
export type ArtistTagsTable = typeof artistTags

export const groups = pgTable("group", {
  ...idColumn,
  name: text("name").notNull().unique(),
  ...metaColumns,
})
export type GroupsTable = typeof groups

export const artistGroups = pgTable("artist_group", {
  artistId: text("artist_id").notNull().references(() => artists.id).unique(),
  groupId: text("group_id").notNull().references(() => groups.id).unique(),
  ...metaColumns,
}, table => ({ pk: primaryKey({ columns: [table.artistId, table.groupId] }) }))
export type ArtistGroupsTable = typeof artistGroups
