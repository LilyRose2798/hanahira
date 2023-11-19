import { PgColumnBuilderBase, PgTableWithColumns, text, timestamp } from "drizzle-orm/pg-core"
import { BuildColumns, TableRelationsHelpers } from "drizzle-orm"
import { users } from "@/lib/db/tables/users"
import { nanoid } from "@/lib/db/tables/nanoid"

export const idColumn = {
  id: text("id").primaryKey().$defaultFn(nanoid),
}
export type IdColumn = typeof idColumn

export const userMetaColumns = {
  createdBy: text("created_by").notNull().references(() => users.id),
  updatedBy: text("updated_by").notNull().references(() => users.id),
} satisfies Record<string, PgColumnBuilderBase>
export type UserMetaColumns = typeof userMetaColumns

export const timestampMetaColumns = {
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
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

export const userMetaRelations = <T extends TableWithUserMeta>(table: T) => ({ one }: Pick<TableRelationsHelpers<T["_"]["name"]>, "one">) => ({
  creator: one(users, { fields: [table.createdBy], references: [users.id], relationName: "creator" }),
  updater: one(users, { fields: [table.updatedBy], references: [users.id], relationName: "updater" }),
})
