import { PgColumnBuilderBase, PgTableWithColumns, text, timestamp } from "drizzle-orm/pg-core"
import { BuildColumns, relations } from "drizzle-orm"
import { users } from "@/lib/db/tables/users"

export const userMetaColumns = {
  createdBy: text("created_by").notNull().references(() => users.id),
  modifiedBy: text("modified_by").notNull().references(() => users.id),
} satisfies Record<string, PgColumnBuilderBase>
export type UserMetaColumns = typeof userMetaColumns

export const timestampMetaColumns = {
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  modifiedAt: timestamp("modified_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
} satisfies Record<string, PgColumnBuilderBase>
export type TimestampMetaColumns = typeof timestampMetaColumns

export const metaColumns = {
  ...userMetaColumns,
  ...timestampMetaColumns,
} satisfies Record<string, PgColumnBuilderBase>
export type MetaColumns = typeof metaColumns

export type TableWithUserMeta = PgTableWithColumns<{ name: string, columns: BuildColumns<string, UserMetaColumns, "pg">, schema: any, dialect: any }>
export type TableWithTimestampMeta = PgTableWithColumns<{ name: string, columns: BuildColumns<string, TimestampMetaColumns, "pg">, schema: any, dialect: any }>
export type TableWithMeta = PgTableWithColumns<{ name: string, columns: BuildColumns<string, MetaColumns, "pg">, schema: any, dialect: any }>

export const userMetaRelations = (table: TableWithUserMeta) => relations(table, ({ one }) => ({
  creator: one(users, { fields: [table.createdBy], references: [users.id], relationName: "creator" }),
  modifier: one(users, { fields: [table.modifiedBy], references: [users.id], relationName: "modifier" }),
}))
