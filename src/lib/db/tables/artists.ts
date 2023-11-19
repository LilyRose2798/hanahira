import { pgTable, primaryKey, text } from "drizzle-orm/pg-core"
import { idColumn, metaColumns, userMetaRelations } from "@/lib/db/tables/utils"
import { relations } from "drizzle-orm"

export const artists = pgTable("artist", {
  ...idColumn,
  ...metaColumns,
})
export type ArtistsTable = typeof artists

export const artistAliases = pgTable("artist_alias", {
  artistId: text("artist_id").notNull().references(() => artists.id),
  name: text("name").unique(),
  ...metaColumns,
}, table => ({ pk: primaryKey({ columns: [table.artistId, table.name] }) }))
export type ArtistAliasesTable = typeof artistAliases

export const artistLinks = pgTable("artist_link", {
  ...idColumn,
  artistId: text("artist_id").notNull().references(() => artists.id),
  name: text("name"),
  url: text("url"),
  ...metaColumns,
})
export type ArtistLinksTable = typeof artistLinks

export const artistAliasesRelations = relations(artistAliases, ({ one }) => ({
  artist: one(artists, { fields: [artistAliases.artistId], references: [artists.id] }),
  ...userMetaRelations(artistAliases)({ one }),
}))

export const artistLinksRelations = relations(artistLinks, ({ one }) => ({
  artist: one(artists, { fields: [artistLinks.artistId], references: [artists.id] }),
  ...userMetaRelations(artistLinks)({ one }),
}))

export const artistRelations = relations(artists, ({ one, many }) => ({
  aliases: many(artistAliases),
  links: many(artistLinks),
  ...userMetaRelations(artists)({ one }),
}))
