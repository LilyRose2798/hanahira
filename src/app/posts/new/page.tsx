import { Metadata } from "next"
import { redirect } from "next/navigation"
import { validateAuth } from "@/lib/lucia"
import { NewPostForm } from "@/components/posts/NewPostForm"

export const metadata: Metadata = { title: "New Post" }

const NewPost = async () => {
  const session = await validateAuth()
  if (!session) redirect("/sign-in")
  return (
    <section className="container mt-6">
      <h1 className="font-semibold text-2xl my-2">New Post</h1>
      <NewPostForm />
    </section>
  )
}

export default NewPost
