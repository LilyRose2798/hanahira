import { Metadata } from "next"
import PostComp from "@/components/posts/Post"
import { api } from "@/lib/trpc/api"

const title = "Post"
export const metadata: Metadata = { title }

const Post = async ({ params: { id } }: { params: { id: string } }) => {
  const post = await api.posts.find.byIdWithUpload.query({ id })
  return (
    <section className="container">
      <h1 className="font-semibold text-2xl my-6">{title}</h1>
      <PostComp post={post} />
    </section>
  )
}

export default Post
