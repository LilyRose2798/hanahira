import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { env } from "@/lib/env.mjs"
import { schema } from "@/lib/db/schema"
import { customAlphabet } from "nanoid"

export const client = postgres(env.DATABASE_URL)
export const db = drizzle(client, { schema })

export const nanoid = customAlphabet(env.NANOID_ALPHABET, env.NANOID_SIZE)
