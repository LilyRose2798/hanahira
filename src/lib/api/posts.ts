import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { posts, postDefaults, PostIdParams, CreatePostParams, ReplacePostParams, UpdatePostParams } from "@/lib/db/schema/posts"
import { parseFound, parseCreated, parseFoundFirst } from "@/lib/api/utils"

const findPostsP = db.query.posts.findMany().prepare("find_posts")
export const findPosts = () => findPostsP.execute()
const findPostByIdP = db.query.posts.findFirst({ where: (posts, { eq, sql }) => eq(posts.id, sql.placeholder("id")) }).prepare("find_post_by_id")
export const findPostById = ({ id }: PostIdParams) => findPostByIdP.execute({ id }).then(parseFound)
export const createPost = (post: CreatePostParams) => db.insert(posts).values(post).returning().execute().then(parseCreated)
export const replacePost = ({ id, ...post }: ReplacePostParams) => db.update(posts)
  .set({ ...postDefaults, ...post }).where(eq(posts.id, id)).returning().execute().then(parseFoundFirst)
export const updatePost = ({ id, ...post }: UpdatePostParams) => db.update(posts)
  .set(post).where(eq(posts.id, id)).returning().execute().then(parseFoundFirst)
export const deletePost = ({ id }: PostIdParams) => db.delete(posts)
  .where(eq(posts.id, id)).returning().execute().then(parseFoundFirst)
