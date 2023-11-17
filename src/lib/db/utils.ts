import { sql, SQL, SQLWrapper, BinaryOperator } from "drizzle-orm"
import { PgColumn } from "drizzle-orm/pg-core"

export const sqlDefault = sql`DEFAULT`
export type SQLDefaults<T> = { [_ in { [K in keyof T]-?: undefined extends T[K] ? K : never }[keyof T]]: SQL }

export const paginationConfig = ({ page = 1, pageSize = 50 }: { page?: number, pageSize?: number }) => ({
  offset: (page - 1) * pageSize,
  limit: pageSize,
})

export const sortingConfig = <T extends Record<string, unknown>>(sort?: string) => ({
  orderBy: sort ? (table: Record<keyof T, PgColumn<any>>) => sort.split(",").map(x => table[x]) : undefined,
})

export const whereConfig = <T extends Record<string, unknown>>(query: Partial<T>, keys: (keyof T)[] = Object.keys(query)) => ({
  where: (
    table: Record<keyof T, PgColumn<any>>,
    { and, eq }: { and: (...conditions: (SQLWrapper | undefined)[]) => SQL<unknown> | undefined, eq: BinaryOperator }
  ) => and(...keys.map(k => (pk => (pk === undefined ? undefined : eq(table[k], pk)))(query[k]))),
})
