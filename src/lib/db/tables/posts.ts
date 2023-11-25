import { boolean, pgTable, primaryKey, text } from "drizzle-orm/pg-core"
import { postRatingEnum, postStatusEnum } from "@/lib/db/tables/enums"
import { idColumn, metaColumns, userMetaRelations } from "@/lib/db/tables/utils"
import { uploads } from "@/lib/db/tables/uploads"
import { tags } from "@/lib/db/tables/tags"
import { poolPosts } from "@/lib/db/tables/pools"
import { relations } from "drizzle-orm"

export const posts = pgTable("post", {
  ...idColumn,
  uploadId: text("upload_id").notNull().unique().references(() => uploads.id),
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

export const postVotes = pgTable("post_vote", {
  postId: text("post_id").notNull().references(() => posts.id),
  upvote: boolean("upvote").notNull().default(true),
  ...metaColumns,
}, table => ({ pk: primaryKey({ columns: [table.postId, table.createdBy] }) }))
export type PostVotesTable = typeof postVotes

export const postFavourites = pgTable("post_favourite", {
  postId: text("post_id").notNull().references(() => posts.id),
  ...metaColumns,
}, table => ({ pk: primaryKey({ columns: [table.postId, table.createdBy] }) }))
export type PostFavouritesTable = typeof postFavourites

export const postComments = pgTable("post_comment", {
  ...idColumn,
  postId: text("post_id").notNull().references(() => posts.id),
  comment: text("comment").notNull(),
  ...metaColumns,
})
export type PostCommentsTable = typeof postComments

export const postCommentVotes = pgTable("post_comment_vote", {
  postCommentId: text("comment_id").notNull().references(() => postComments.id),
  upvote: boolean("upvote").notNull().default(true),
  ...metaColumns,
}, table => ({ pk: primaryKey({ columns: [table.postCommentId, table.createdBy] }) }))
export type PostCommentVotesTable = typeof postCommentVotes

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

export const postVoteRelations = relations(postVotes, ({ one }) => ({
  post: one(posts, { fields: [postVotes.postId], references: [posts.id] }),
  ...userMetaRelations(postVotes)({ one }),
}))

export const postFavouriteRelations = relations(postFavourites, ({ one }) => ({
  post: one(posts, { fields: [postFavourites.postId], references: [posts.id] }),
  ...userMetaRelations(postFavourites)({ one }),
}))

export const postCommentRelations = relations(postComments, ({ one, many }) => ({
  post: one(posts, { fields: [postComments.postId], references: [posts.id] }),
  votes: many(postCommentVotes),
  ...userMetaRelations(postComments)({ one }),
}))

export const postCommentVoteRelations = relations(postCommentVotes, ({ one }) => ({
  comment: one(postComments, { fields: [postCommentVotes.postCommentId], references: [postComments.id] }),
  ...userMetaRelations(postCommentVotes)({ one }),
}))

export const postRelations = relations(posts, ({ one, many }) => ({
  upload: one(uploads, { fields: [posts.uploadId], references: [uploads.id] }),
  parentPost: one(postParents, { fields: [posts.id], references: [postParents.postId], relationName: "parent" }),
  parentOfPosts: many(postParents, { relationName: "parentPost" }),
  tags: many(postTags),
  pools: many(poolPosts),
  votes: many(postVotes),
  favourites: many(postFavourites),
  comments: many(postComments),
  ...userMetaRelations(posts)({ one }),
}))
