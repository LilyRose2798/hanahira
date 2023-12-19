import { boolean, pgTable, primaryKey, text } from "drizzle-orm/pg-core"
import { postRatingEnum, postStatusEnum } from "@/lib/db/tables/enums"
import { idColumn } from "@/lib/db/tables/utils"
import { metaColumns } from "@/lib/db/tables/users"
import { uploads } from "@/lib/db/tables/uploads"
import { tags } from "@/lib/db/tables/tags"

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
