import PostList from "@/components/posts/PostList"
import PostSearchForm from "@/components/posts/PostSearchForm"
import { api } from "@/lib/trpc/api"
import { authErrorRedirect } from "@/lib/trpc/utils"
import { Metadata } from "next"

const title = "Posts"
export const metadata: Metadata = { title }
export const dynamic = "force-dynamic"

const Posts = async ({ searchParams }: { searchParams?: { search?: string } }) => {
  const posts = await api.posts.find.manyWithUpload.query().catch(authErrorRedirect) // use search in query
  // lookup tags and pass to PostSearchForm for autocomplete
  return (
    <section className="container mt-6">
      <h1 className="font-semibold text-2xl my-2">{title}</h1>
      <PostSearchForm />
      <PostList posts={posts} />
    </section>
  )
}

export default Posts
