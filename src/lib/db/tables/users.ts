import { relations } from "drizzle-orm"
import { pgTable, text } from "drizzle-orm/pg-core"
import { sessions } from "@/lib/db/tables/sessions"
import { tagAliases, tagImplications, tags } from "@/lib/db/tables/tags"
import { postCommentRatings, postComments, postFavourites, postParents, postRatings, postTags, posts } from "@/lib/db/tables/posts"
import { poolPosts, pools } from "@/lib/db/tables/pools"
import { artistAliases, artistLinks, artists } from "@/lib/db/tables/artists"
import { userRoleEnum } from "@/lib/db/tables/enums"
import { idColumn, timestampMetaColumns } from "@/lib/db/tables/utils"
import { defaultUserRole } from "@/lib/db/enums/userRole"

export const users = pgTable("user", {
  ...idColumn,
  username: text("username").notNull().unique(),
  name: text("name"),
  email: text("email"),
  role: userRoleEnum("role").notNull().default(defaultUserRole),
  passwordHash: text("password_hash").notNull(),
  ...timestampMetaColumns,
})
export type UsersTable = typeof users

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  postRatings: many(postRatings),
  postFavourites: many(postFavourites),
  postComments: many(postComments),
  postCommentRatings: many(postCommentRatings),
  createdTags: many(tags, { relationName: "creator" }),
  updatedTags: many(tags, { relationName: "updater" }),
  createdTagAliases: many(tagAliases, { relationName: "creator" }),
  updatedTagAliases: many(tagAliases, { relationName: "updater" }),
  createdTagImplications: many(tagImplications, { relationName: "creator" }),
  updatedTagImplications: many(tagImplications, { relationName: "updater" }),
  createdPosts: many(posts, { relationName: "creator" }),
  updatedPosts: many(posts, { relationName: "updater" }),
  createdPostParents: many(postParents, { relationName: "creator" }),
  updatedPostParents: many(postParents, { relationName: "updater" }),
  createdPostTags: many(postTags, { relationName: "creator" }),
  updatedPostTags: many(postTags, { relationName: "updater" }),
  createdPools: many(pools, { relationName: "creator" }),
  updatedPools: many(pools, { relationName: "updater" }),
  createdPoolPosts: many(poolPosts, { relationName: "creator" }),
  updatedPoolPosts: many(poolPosts, { relationName: "updater" }),
  createdArtists: many(artists, { relationName: "creator" }),
  updatedArtists: many(artists, { relationName: "updater" }),
  createdArtistAliases: many(artistAliases, { relationName: "creator" }),
  updatedArtistAliases: many(artistAliases, { relationName: "updater" }),
  createdArtistLinks: many(artistLinks, { relationName: "creator" }),
  updatedArtistLinks: many(artistLinks, { relationName: "updater" }),
}))

export const schema = { users }
