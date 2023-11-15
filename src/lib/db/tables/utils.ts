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

export const metaRelations = (table: PgTableWithColumns<
  { name: string, columns: BuildColumns<string, typeof metaColumns, "pg">, schema: any, dialect: any }
>) => relations(table, ({ one }) => ({
  creator: one(users, { fields: [table.createdBy], references: [users.id] }),
  modifier: one(users, { fields: [table.modifiedBy], references: [users.id] }),
}))
