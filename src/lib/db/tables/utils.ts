import { PgTableWithColumns, text } from "drizzle-orm/pg-core"
import { nanoid } from "@/lib/db/tables/nanoid"
import { BuildColumns, ColumnBuilderBase } from "drizzle-orm"

export const idColumn = {
  id: text("id").primaryKey().$defaultFn(nanoid),
}
export type IdColumn = typeof idColumn

export type TableWithColumns<TColumns extends Record<string, ColumnBuilderBase>> = PgTableWithColumns<{ name: string, columns: BuildColumns<string, TColumns, "pg">, schema: any, dialect: any }>
