import { pgTable, primaryKey, text } from "drizzle-orm/pg-core"
import { idColumn } from "@/lib/db/tables/utils"
import { metaColumns } from "@/lib/db/tables/users"

export const artists = pgTable("artist", {
  ...idColumn,
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
