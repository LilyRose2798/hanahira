import { customAlphabet } from "nanoid"
import { env } from "@/lib/env.mjs"

export const nanoid = customAlphabet(env.NANOID_ALPHABET, env.NANOID_LENGTH)
export const nanoidSecure = customAlphabet(env.NANOID_ALPHABET, env.NANOID_LENGTH_SECURE)
