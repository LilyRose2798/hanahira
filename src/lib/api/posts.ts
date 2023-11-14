import { db, nanoid } from "@/lib/db"
import { whereConfig, paginationConfig, sortingConfig } from "@/lib/db/utils"
import { eq } from "drizzle-orm"
import { posts, postDefaults, PostIdParams, PostCreatedByParams, CreatePostParams, ReplacePostParams, UpdatePostParams, QueryPostParams } from "@/lib/db/schema/posts"
import { parseFound, parseCreated, parseFoundFirst } from "@/lib/api/utils"

export const findPosts = ({ page, sort, ...post }: QueryPostParams = {}) => db.query.posts
  .findMany({ ...whereConfig(post), ...paginationConfig({ page }), ...sortingConfig(sort) }).execute().then(parseFound)
export const findPostById = ({ id }: PostIdParams) => db.query.posts
  .findFirst({ where: (posts, { eq }) => eq(posts.id, id) }).execute().then(parseFound)
export const findPostsByCreator = ({ createdBy }: PostCreatedByParams) => db.query.posts
  .findMany({ where: (posts, { eq }) => eq(posts.createdBy, createdBy) }).execute().then(parseFound)
export const createPost = (post: CreatePostParams & PostCreatedByParams) => db.insert(posts)
  .values({ ...post, id: nanoid() }).returning().execute().then(parseCreated)
export const replacePost = ({ id, ...post }: ReplacePostParams & PostCreatedByParams) => db.update(posts)
  .set({ ...postDefaults, ...post }).where(eq(posts.id, id)).returning().execute().then(parseFoundFirst)
export const updatePost = ({ id, ...post }: UpdatePostParams & PostCreatedByParams) => db.update(posts)
  .set(post).where(eq(posts.id, id)).returning().execute().then(parseFoundFirst)
export const deletePost = ({ id }: PostIdParams) => db.delete(posts)
  .where(eq(posts.id, id)).returning().execute().then(parseFoundFirst)
