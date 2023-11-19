import { pgEnum } from "drizzle-orm/pg-core"
import { userRoles } from "@/lib/db/enums/userRole"
import { postRatings } from "@/lib/db/enums/postRating"
import { postStatuses } from "@/lib/db/enums/postStatus"

export const userRoleEnum = pgEnum("user_role", userRoles)
export const postRatingEnum = pgEnum("post_rating", postRatings)
export const postStatusEnum = pgEnum("post_status", postStatuses)
