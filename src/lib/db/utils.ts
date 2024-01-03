import { sql, SQL, SQLWrapper, BinaryOperator, AnyColumn, Table } from "drizzle-orm"
import { PgColumn } from "drizzle-orm/pg-core"

export const sqlDefault = sql`DEFAULT`
export type SQLDefaults<T> = { [_ in { [K in keyof T]-?: undefined extends T[K] ? K : never }[keyof T]]: SQL }

export const sqlNowPlusSeconds = (seconds: number) => sql.raw(`NOW() + INTERVAL '${seconds} SECONDS'`)

export const paginationConfig = ({ page = 1, pageSize = 50 }: { page?: number, pageSize?: number }) => ({
  offset: (page - 1) * pageSize,
  limit: pageSize,
})

export const sortingConfig = (sort?: string) => ({
  orderBy: sort ? (fields: Record<string, PgColumn<any>>, { asc, desc }: {
    asc: (column: AnyColumn) => SQL, desc: (column: AnyColumn) => SQL }) => (sort
    .split(",")
    .map(x => x.match(/^([^:]*)(?::(asc|desc))?$/))
    .filter(m => m && m[1] in fields) as RegExpMatchArray[])
    .map(([_, field, order]) => [fields[field], order] as [AnyColumn, "asc" | "desc" | undefined])
    .map(([column, order]) => (order === "asc" ? asc(column) : order === "desc" ? desc(column) : column)) : undefined,
})

export const fieldsConfig = (table: Table, fields?: string) => ({
  columns: fields ? Object.fromEntries(fields
    .split(",")
    .filter(x => x in table)
    .map(x => [x, true])) : undefined,
})

export const whereConfig = <T extends Record<string, unknown>>(query: Partial<T>, keys: (keyof T)[] = Object.keys(query)) => ({
  where: (
    fields: Record<keyof T, PgColumn<any>>,
    { and, eq }: { and: (...conditions: (SQLWrapper | undefined)[]) => SQL | undefined, eq: BinaryOperator }
  ) => and(...keys.map(k => (pk => (pk === undefined ? undefined : eq(fields[k], pk)))(query[k]))),
})
