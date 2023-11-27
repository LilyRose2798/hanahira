import PostList from "@/components/posts/PostList"
import PostModal from "@/components/posts/PostModal"
import { validateAuth } from "@/lib/lucia"
import { api } from "@/lib/trpc/api"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Posts" }

const Posts = async () => {
  const { session } = await validateAuth()
  const signedIn = !!session
  const posts = await api.posts.find.manyWithUpload.query()
  return (
    <section className="container mt-6">
      <div className="flex justify-between">
        <h1 className="font-semibold text-2xl my-2">Posts</h1>
        {signedIn && <PostModal />}
      </div>
      <PostList posts={posts} canEdit={signedIn} />
    </section>
  )
}

export default Posts
