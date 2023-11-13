import { db, nanoid } from "@/lib/db"
import { eq } from "drizzle-orm"
import { posts, postDefaults, PostIdParams, PostCreatedByParams, CreatePostParams, ReplacePostParams, UpdatePostParams } from "@/lib/db/schema/posts"
import { parseFound, parseCreated, parseFoundFirst } from "@/lib/api/utils"

const findPostsP = db.query.posts.findMany().prepare("find_posts")
export const findPosts = () => findPostsP.execute()
const findPostByIdP = db.query.posts.findFirst({ where: (posts, { eq, sql }) => eq(posts.id, sql.placeholder("id")) }).prepare("find_post_by_id")
export const findPostById = ({ id }: PostIdParams) => findPostByIdP.execute({ id }).then(parseFound)
const findPostsByCreatorP = db.query.posts.findMany({ where: (posts, { eq, sql }) => eq(posts.createdBy, sql.placeholder("createdBy")) }).prepare("find_posts_by_creator")
export const findPostsByCreator = ({ createdBy }: PostCreatedByParams) => findPostsByCreatorP.execute({ createdBy }).then(parseFound)
export const createPost = (post: CreatePostParams & PostCreatedByParams) => db.insert(posts)
  .values({ ...post, id: nanoid() }).returning().execute().then(parseCreated)
export const replacePost = ({ id, ...post }: ReplacePostParams & PostCreatedByParams) => db.update(posts)
  .set({ ...postDefaults, ...post }).where(eq(posts.id, id)).returning().execute().then(parseFoundFirst)
export const updatePost = ({ id, ...post }: UpdatePostParams & PostCreatedByParams) => db.update(posts)
  .set(post).where(eq(posts.id, id)).returning().execute().then(parseFoundFirst)
export const deletePost = ({ id }: PostIdParams) => db.delete(posts)
  .where(eq(posts.id, id)).returning().execute().then(parseFoundFirst)
