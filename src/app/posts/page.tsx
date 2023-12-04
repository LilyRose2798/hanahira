import PostList from "@/components/posts/PostList"
import { api } from "@/lib/trpc/api"
import { authErrorRedirect } from "@/lib/trpc/utils"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Posts" }
export const dynamic = "force-dynamic"

const Posts = async () => {
  const posts = await api.posts.find.manyWithUpload.query().catch(authErrorRedirect)
  return (
    <section className="container mt-6">
      <h1 className="font-semibold text-2xl my-2">Posts</h1>
      <PostList posts={posts} />
    </section>
  )
}

export default Posts
