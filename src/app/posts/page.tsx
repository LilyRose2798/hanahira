import PostList from "@/components/posts/PostList"
import PostModal from "@/components/posts/PostModal"
import { findPosts } from "@/lib/api/posts"
import { validateAuth } from "@/lib/lucia"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Posts" }

const Posts = async () => {
  const { session } = await validateAuth()
  const signedIn = !!session
  const posts = await findPosts({ with: { upload: true } })
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
