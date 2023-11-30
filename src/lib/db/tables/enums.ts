import { pgEnum } from "drizzle-orm/pg-core"
import { userRoles } from "@/lib/db/enums/user-role"
import { postRatings } from "@/lib/db/enums/post-rating"
import { postStatuses } from "@/lib/db/enums/post-status"

export const userRoleEnum = pgEnum("user_role", userRoles)
export const postRatingEnum = pgEnum("post_rating", postRatings)
export const postStatusEnum = pgEnum("post_status", postStatuses)
