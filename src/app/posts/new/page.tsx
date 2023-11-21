import { Metadata } from "next"
import { redirect } from "next/navigation"
import { validateAuth } from "@/lib/lucia"
import { NewPostForm } from "@/components/posts/NewPostForm"

export const metadata: Metadata = { title: "New Post" }

const NewPost = async () => {
  const { session } = await validateAuth()
  if (!session) redirect("/sign-in")
  // have query param for upload ids to use
  return (
    <section className="container">
      <h1 className="font-semibold text-2xl my-6">New Post</h1>
      <NewPostForm />
    </section>
  )
}

export default NewPost
