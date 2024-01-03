import { createEnv } from "@t3-oss/env-nextjs"
import { urlAlphabet } from "nanoid"
import { z } from "zod"
import "dotenv/config"

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    BASE_URL: z.string().url(),
    DATABASE_URL: z.string().min(1),
    EMAIL_SERVER: z.string().url(),
    EMAIL_FROM: z.string().min(1),
    NANOID_ALPHABET: z.string().min(2).max(256).default(urlAlphabet),
    NANOID_LENGTH: z.number().int().min(2).max(36).default(12),
    NANOID_LENGTH_SECURE: z.number().int().min(2).max(36).default(24),
  },
  client: {
    // NEXT_PUBLIC_PUBLISHABLE_KEY: z.string().min(1),
  },
  // eslint-disable-next-line camelcase
  experimental__runtimeEnv: {
    // NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  },
})
