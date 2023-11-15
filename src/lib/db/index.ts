import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { env } from "@/lib/env.mjs"
import * as schema from "@/lib/db/tables"

// eslint-disable-next-line camelcase
export const client = postgres(env.DATABASE_URL, { idle_timeout: 30, max_lifetime: 600 })
export const db = drizzle(client, { schema })
