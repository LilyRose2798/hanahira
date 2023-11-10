import * as users from "@/lib/db/schema/users"
import * as sessions from "@/lib/db/schema/sessions"
import * as keys from "@/lib/db/schema/keys"
import * as posts from "@/lib/db/schema/posts"

export const schema = { ...users, ...sessions, ...keys, ...posts }
