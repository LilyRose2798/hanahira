import { db } from "@/lib/db"
import { whereConfig, paginationConfig, sortingConfig, fieldsConfig } from "@/lib/db/utils"
import { KnownKeysOnly, eq } from "drizzle-orm"
import { postDefaults, PostIdParams, PostsCreatedByParams, PostsUpdatedByParams, CreatePostParams, ReplacePostParams, UpdatePostParams, QueryPostsParams, QueryPostIdParams } from "@/lib/db/schemas/posts"
import { posts } from "@/lib/db/tables/posts"
import { parseFound, parseCreated, parseFoundFirst, limit } from "@/lib/api/utils"
import { UsernameParams, QueryCreatedByIdParams, QueryCreatedByUsernameParams } from "@/lib/db/schemas/users"
import { findUserByUsername } from "@/lib/api/users"

type FindPostsParams = NonNullable<Parameters<typeof db.query.posts.findMany>[0]>
type FindPostParams = Omit<FindPostsParams, "limit">

export const findPosts = <T extends FindPostsParams>(config: KnownKeysOnly<T, FindPostsParams>) => db.query.posts
  .findMany({ limit, ...config }).execute().then(parseFound)

export const findPostById = <T extends PostIdParams & FindPostParams>(
  { id, ...config }: KnownKeysOnly<T, PostIdParams & FindPostParams>) => db.query.posts
    .findFirst({ where: (posts, { eq }) => eq(posts.id, id), ...config }).execute().then(parseFound)

export const findPostsCreatedBy = <T extends PostsCreatedByParams & FindPostParams>(
  { createdBy, limit, ...config }: KnownKeysOnly<T, PostsCreatedByParams & FindPostParams>) => db.query.posts
    .findMany({ where: (posts, { eq }) => eq(posts.createdBy, createdBy), ...config }).execute().then(parseFound)

export const findPostsCreatedByUsername = <T extends UsernameParams & FindPostParams>(
  { username, limit, ...config }: KnownKeysOnly<T, UsernameParams & FindPostParams>) => (
    findUserByUsername({ username, columns: { id: true } }).then(({ id: createdBy }) => findPostsCreatedBy({ createdBy, ...config })))

export const queryPosts = ({ fields, page, sort, ...post }: QueryPostsParams) => db.query.posts.findMany({
  ...whereConfig(post),
  ...fieldsConfig(posts, fields),
  ...paginationConfig({ page }),
  ...sortingConfig(sort),
}).execute().then(parseFound)

export const queryPostById = ({ id, fields }: QueryPostIdParams) => db.query.posts.findFirst({
  where: (posts, { eq }) => eq(posts.id, id),
  ...fieldsConfig(posts, fields),
}).execute().then(parseFound)

export const queryPostsCreatedById = ({ id, fields, page, sort }: QueryCreatedByIdParams) => db.query.posts.findMany({
  where: (posts, { eq }) => eq(posts.createdBy, id),
  ...fieldsConfig(posts, fields),
  ...paginationConfig({ page }),
  ...sortingConfig(sort),
}).execute().then(parseFound)

export const queryPostsCreatedByUsername = ({ username, ...config }: QueryCreatedByUsernameParams) => (
  findUserByUsername({ username, columns: { id: true } }).then(({ id }) => queryPostsCreatedById({ id, ...config })))

export const createPost = (post: CreatePostParams & PostsCreatedByParams) => db.insert(posts)
  .values({ ...post, updatedBy: post.createdBy }).returning().execute().then(parseCreated)

export const replacePost = ({ id, ...post }: ReplacePostParams & PostsUpdatedByParams) => db.update(posts)
  .set({ ...postDefaults, ...post, updatedAt: new Date() }).where(eq(posts.id, id)).returning().execute().then(parseFoundFirst)

export const updatePost = ({ id, ...post }: UpdatePostParams & PostsUpdatedByParams) => db.update(posts)
  .set({ ...post, updatedAt: new Date() }).where(eq(posts.id, id)).returning().execute().then(parseFoundFirst)

export const deletePost = ({ id }: PostIdParams) => db.delete(posts)
  .where(eq(posts.id, id)).returning().execute().then(parseFoundFirst)
