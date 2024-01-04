import { PgTableWithColumns, text, timestamp } from "drizzle-orm/pg-core"
import { nanoid, nanoidSecure } from "@/lib/db/tables/nanoid"
import { BuildColumns, ColumnBuilderBase } from "drizzle-orm"
import { sqlNowPlusSeconds } from "@/lib/db/utils"

export const idColumn = {
  id: text("id").primaryKey().$defaultFn(nanoid),
}
export type IdColumn = typeof idColumn

export const idColumnSecure = {
  id: text("id").primaryKey().$defaultFn(nanoidSecure),
}
export type IdColumnSecure = typeof idColumn

export const expiresAtColumn = (seconds: number) => ({
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull().default(sqlNowPlusSeconds(seconds)),
})

export type TableWithColumns<TColumns extends Record<string, ColumnBuilderBase>> = PgTableWithColumns<{ name: string, columns: BuildColumns<string, TColumns, "pg">, schema: any, dialect: any }>
