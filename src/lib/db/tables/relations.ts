import { relations, TableRelationsHelpers } from "drizzle-orm"
import { users, UserMetaColumns } from "@/lib/db/tables/users"
import { sessions } from "@/lib/db/tables/sessions"
import { emailVerifications } from "@/lib/db/tables/email-verifications"
import { passwordResets } from "@/lib/db/tables/password-resets"
import { uploads } from "@/lib/db/tables/uploads"
import { tagAliases, tagImplications, tagTypes, tags } from "@/lib/db/tables/tags"
import { postCommentVotes, postComments, postFavourites, postParents, postVotes, postTags, posts } from "@/lib/db/tables/posts"
import { poolPosts, pools } from "@/lib/db/tables/pools"
import { artistAliases, artistGroups, artistLinks, artists, artistTags, groups } from "@/lib/db/tables/artists"
import { TableWithColumns } from "@/lib/db/tables/utils"

export const userRelations = relations(users, ({ many }) => ({
  createdSessions: many(sessions, { relationName: "creator" }),
  updatedSessions: many(sessions, { relationName: "updater" }),
  createdUploads: many(uploads, { relationName: "creator" }),
  updatedUploads: many(uploads, { relationName: "updater" }),
  createdPostVotes: many(postVotes, { relationName: "creator" }),
  updatedPostVotes: many(postVotes, { relationName: "updater" }),
  createdPostFavourites: many(postFavourites, { relationName: "creator" }),
  updatedPostFavourites: many(postFavourites, { relationName: "updater" }),
  createdPostComments: many(postComments, { relationName: "creator" }),
  updatedPostComments: many(postComments, { relationName: "updater" }),
  createdPostCommentVotes: many(postCommentVotes, { relationName: "creator" }),
  updatedPostCommentVotes: many(postCommentVotes, { relationName: "updater" }),
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
  createdTags: many(tags, { relationName: "creator" }),
  updatedTags: many(tags, { relationName: "updater" }),
  createdTagAliases: many(tagAliases, { relationName: "creator" }),
  updatedTagAliases: many(tagAliases, { relationName: "updater" }),
  createdTagImplications: many(tagImplications, { relationName: "creator" }),
  updatedTagImplications: many(tagImplications, { relationName: "updater" }),
  createdArtists: many(artists, { relationName: "creator" }),
  updatedArtists: many(artists, { relationName: "updater" }),
  createdArtistAliases: many(artistAliases, { relationName: "creator" }),
  updatedArtistAliases: many(artistAliases, { relationName: "updater" }),
  createdArtistLinks: many(artistLinks, { relationName: "creator" }),
  updatedArtistLinks: many(artistLinks, { relationName: "updater" }),
}))

const userMetaRelations = <T extends TableWithColumns<UserMetaColumns>>(table: T) => ({ one }: Pick<TableRelationsHelpers<T["_"]["name"]>, "one">) => ({
  creator: one(users, { fields: [table.createdBy], references: [users.id], relationName: "creator" }),
  updater: one(users, { fields: [table.updatedBy], references: [users.id], relationName: "updater" }),
})

export const sessionUserRelations = relations(sessions, userMetaRelations(sessions))

export const emailVerificationUserRelations = relations(emailVerifications, userMetaRelations(emailVerifications))

export const passwordResetUserRelations = relations(passwordResets, userMetaRelations(passwordResets))

export const uploadRelations = relations(uploads, ({ one, many }) => ({
  post: one(posts),
  ...userMetaRelations(uploads)({ one }),
}))

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

export const poolPostRelations = relations(poolPosts, ({ one }) => ({
  pool: one(pools, { fields: [poolPosts.poolId], references: [pools.id] }),
  post: one(posts, { fields: [poolPosts.postId], references: [posts.id] }),
  ...userMetaRelations(poolPosts)({ one }),
}))

export const poolRelations = relations(pools, ({ one, many }) => ({
  posts: many(poolPosts),
  ...userMetaRelations(pools)({ one }),
}))

export const tagTypeRelations = relations(tagTypes, ({ one, many }) => ({
  tags: many(tags),
  ...userMetaRelations(tagAliases)({ one }),
}))

export const tagAliasRelations = relations(tagAliases, ({ one }) => ({
  tag: one(tags, { fields: [tagAliases.tagId], references: [tags.id] }),
  ...userMetaRelations(tagAliases)({ one }),
}))

export const tagImplicationRelations = relations(tagImplications, ({ one }) => ({
  tag: one(tags, { fields: [tagImplications.tagId], references: [tags.id], relationName: "tag" }),
  impliesTag: one(tags, { fields: [tagImplications.impliesTagId], references: [tags.id], relationName: "impliesTag" }),
  ...userMetaRelations(tagImplications)({ one }),
}))

export const tagRelations = relations(tags, ({ one, many }) => ({
  type: one(tagTypes, { fields: [tags.typeId], references: [tagTypes.id] }),
  aliases: many(tagAliases),
  impliesTags: many(tagImplications, { relationName: "tag" }),
  impliedByTags: many(tagImplications, { relationName: "impliesTag" }),
  posts: many(postTags),
  artistTag: one(artistTags),
  ...userMetaRelations(tags)({ one }),
}))

export const artistTagRelations = relations(artistTags, ({ one }) => ({
  artist: one(artists, { fields: [artistTags.artistId], references: [artists.id] }),
  tag: one(tags, { fields: [artistTags.tagId], references: [tags.id] }),
  ...userMetaRelations(artistTags)({ one }),
}))

export const artistAliasesRelations = relations(artistAliases, ({ one }) => ({
  artist: one(artists, { fields: [artistAliases.artistId], references: [artists.id] }),
  ...userMetaRelations(artistAliases)({ one }),
}))

export const artistLinksRelations = relations(artistLinks, ({ one }) => ({
  artist: one(artists, { fields: [artistLinks.artistId], references: [artists.id] }),
  ...userMetaRelations(artistLinks)({ one }),
}))

export const artistRelations = relations(artists, ({ one, many }) => ({
  aliases: many(artistAliases),
  links: many(artistLinks),
  groups: many(artistGroups),
  tag: one(artistTags),
  ...userMetaRelations(artists)({ one }),
}))

export const artistGroupRelations = relations(artistGroups, ({ one }) => ({
  artist: one(artists, { fields: [artistGroups.artistId], references: [artists.id] }),
  group: one(groups, { fields: [artistGroups.groupId], references: [groups.id] }),
  ...userMetaRelations(artistGroups)({ one }),
}))

export const groupRelations = relations(groups, ({ one, many }) => ({
  artistGroups: many(artistGroups),
  ...userMetaRelations(groups)({ one }),
}))
