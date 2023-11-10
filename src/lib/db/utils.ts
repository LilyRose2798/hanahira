import { SQL, sql } from "drizzle-orm"

export const sqlDefault = sql`DEFAULT`
export type SQLDefaults<T> = { [_ in { [K in keyof T]-?: undefined extends T[K] ? K : never }[keyof T]]: SQL }
