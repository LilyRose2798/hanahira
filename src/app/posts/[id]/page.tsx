import { Metadata } from "next"
import { findPostById } from "@/lib/api/posts"
import PostComp from "@/components/posts/Post"

export const metadata: Metadata = { title: "Post" }

const Post = async ({ params: { id } }: { params: { id: string } }) => {
  const post = await findPostById({ id, with: { upload: true } })
  return (
    <section className="container">
      <h1 className="font-semibold text-2xl my-6">Post</h1>
      <PostComp post={post} />
    </section>
  )
}

export default Post
