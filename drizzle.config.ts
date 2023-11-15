import type { Config } from "drizzle-kit"
import { env } from "@/lib/env.mjs"

export default {
  schema: "./src/lib/db/tables/index.ts",
  out: "./src/lib/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
} satisfies Config
