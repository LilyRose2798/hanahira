import { boolean, pgTable, primaryKey, text } from "drizzle-orm/pg-core"
import { postRatingEnum, postStatusEnum } from "@/lib/db/tables/enums"
import { idColumn, metaColumns, userMetaRelations } from "@/lib/db/tables/utils"
import { tags } from "@/lib/db/tables/tags"
import { poolPosts } from "@/lib/db/tables/pools"
import { users } from "@/lib/db/tables/users"
import { relations } from "drizzle-orm"

const { updatedBy: _, ...altMetaColumns } = metaColumns

export const posts = pgTable("post", {
  ...idColumn,
  description: text("description"),
  sourceUrl: text("source_url"),
  rating: postRatingEnum("rating").notNull(),
  status: postStatusEnum("status").notNull().default("ACTIVE"),
  ...metaColumns,
})
export type PostsTable = typeof posts

export const postParents = pgTable("post_parent", {
  postId: text("post_id").notNull().primaryKey().references(() => posts.id),
  parentPostId: text("parent_post_id").notNull().references(() => posts.id),
  ...metaColumns,
})
export type PostParentsTable = typeof postParents

export const postTags = pgTable("post_tag", {
  postId: text("post_id").notNull().references(() => posts.id),
  tagId: text("tag_id").notNull().references(() => tags.id),
  ...metaColumns,
}, table => ({ pk: primaryKey({ columns: [table.postId, table.tagId] }) }))
export type PostTagsTable = typeof postTags

export const postRatings = pgTable("post_rating", {
  postId: text("post_id").references(() => posts.id).notNull(),
  positive: boolean("postitive").notNull().default(true),
  ...altMetaColumns,
}, table => ({ pk: primaryKey({ columns: [table.postId, table.createdBy] }) }))
export type PostRatingsTable = typeof postRatings

export const postFavourites = pgTable("post_favourite", {
  postId: text("post_id").references(() => posts.id).notNull(),
  ...altMetaColumns,
}, table => ({ pk: primaryKey({ columns: [table.postId, table.createdBy] }) }))
export type PostFavouritesTable = typeof postFavourites

export const postComments = pgTable("post_comment", {
  ...idColumn,
  postId: text("post_id").references(() => posts.id).notNull(),
  comment: text("comment").notNull(),
  ...altMetaColumns,
})
export type PostCommentsTable = typeof postComments

export const postCommentRatings = pgTable("post_comment_rating", {
  userId: text("user_id").references(() => users.id).notNull(),
  postCommentId: text("comment_id").references(() => postComments.id).notNull(),
  positive: boolean("postitive").notNull().default(true),
  ...altMetaColumns,
}, table => ({ pk: primaryKey({ columns: [table.userId, table.postCommentId] }) }))
export type PostCommentRatingsTable = typeof postCommentRatings

export const postParentRelations = relations(postParents, ({ one }) => ({
  post: one(posts, { fields: [postParents.postId], references: [posts.id], relationName: "post" }),
  parentPost: one(posts, { fields: [postParents.parentPostId], references: [posts.id], relationName: "parentPost" }),
  ...userMetaRelations(postParents)({ one }),
}))

export const postTagRelations = relations(postTags, ({ one }) => ({
  post: one(posts, { fields: [postTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postTags.tagId], references: [tags.id] }),
  ...userMetaRelations(postTags)({ one }),
}))

export const postRatingRelations = relations(postRatings, ({ one }) => ({
  post: one(posts, { fields: [postRatings.postId], references: [posts.id] }),
  creator: one(users, { fields: [postRatings.createdBy], references: [users.id] }),
}))

export const postFavouriteRelations = relations(postFavourites, ({ one }) => ({
  post: one(posts, { fields: [postFavourites.postId], references: [posts.id] }),
  creator: one(users, { fields: [postFavourites.createdBy], references: [users.id] }),
}))

export const postCommentRelations = relations(postComments, ({ one, many }) => ({
  post: one(posts, { fields: [postComments.postId], references: [posts.id] }),
  creator: one(users, { fields: [postComments.createdBy], references: [users.id] }),
  ratings: many(postCommentRatings),
}))

export const postCommentRatingRelations = relations(postCommentRatings, ({ one }) => ({
  comment: one(postComments, { fields: [postCommentRatings.postCommentId], references: [postComments.id] }),
  creator: one(users, { fields: [postCommentRatings.createdBy], references: [users.id] }),
}))

export const postRelations = relations(posts, ({ one, many }) => ({
  parentPost: one(postParents, { fields: [posts.id], references: [postParents.postId], relationName: "parent" }),
  parentOfPosts: many(postParents, { relationName: "parentPost" }),
  tags: many(postTags),
  pools: many(poolPosts),
  ratings: many(postRatings),
  favourites: many(postFavourites),
  comments: many(postComments),
  ...userMetaRelations(posts)({ one }),
}))
