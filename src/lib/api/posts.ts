import { db } from "@/lib/db"
import { whereConfig, paginationConfig, sortingConfig } from "@/lib/db/utils"
import { eq } from "drizzle-orm"
import { postDefaults, PostIdParams, PostCreatedByParams, PostModifiedByParams, CreatePostParams, ReplacePostParams, UpdatePostParams, QueryPostParams } from "@/lib/db/schemas/posts"
import { posts } from "@/lib/db/tables/posts"
import { parseFound, parseCreated, parseFoundFirst } from "@/lib/api/utils"
import nanoid from "@/lib/db/nanoid"
import { UserIdParams, UsernameParams } from "@/lib/db/schemas/users"

export const findPosts = ({ page, sort, ...post }: QueryPostParams = {}) => db.query.posts
  .findMany({ ...whereConfig(post), ...paginationConfig({ page }), ...sortingConfig(sort) }).execute().then(parseFound)
export const findPostById = ({ id }: PostIdParams) => db.query.posts
  .findFirst({ where: (posts, { eq }) => eq(posts.id, id) }).execute().then(parseFound)
export const findPostsCreatedById = ({ id }: UserIdParams) => db.query.posts
  .findMany({ where: (posts, { eq }) => eq(posts.createdBy, id) }).execute().then(parseFound)
export const findPostsCreatedByUsername = ({ username }: UsernameParams) => db.query.users
  .findFirst({ with: { posts: true }, where: (users, { eq }) => eq(users.username, username) })
  .execute().then(parseFound).then(x => x.posts)
export const createPost = (post: CreatePostParams & PostCreatedByParams) => db.insert(posts)
  .values({ ...post, id: nanoid(), modifiedBy: post.createdBy }).returning().execute().then(parseCreated)
export const replacePost = ({ id, ...post }: ReplacePostParams & PostModifiedByParams) => db.update(posts)
  .set({ ...postDefaults, ...post, modifiedAt: new Date() }).where(eq(posts.id, id)).returning().execute().then(parseFoundFirst)
export const updatePost = ({ id, ...post }: UpdatePostParams & PostModifiedByParams) => db.update(posts)
  .set({ ...post, modifiedAt: new Date() }).where(eq(posts.id, id)).returning().execute().then(parseFoundFirst)
export const deletePost = ({ id }: PostIdParams) => db.delete(posts)
  .where(eq(posts.id, id)).returning().execute().then(parseFoundFirst)
