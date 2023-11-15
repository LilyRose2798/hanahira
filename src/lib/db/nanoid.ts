import { customAlphabet } from "nanoid"
import { env } from "@/lib/env.mjs"

export const nanoid = customAlphabet(env.NANOID_ALPHABET, env.NANOID_SIZE)
export default nanoid
