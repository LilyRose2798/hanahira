import NewPostForm from "@/components/posts/NewPostForm"
import { validateAuth } from "@/lib/lucia"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = { title: "New Upload" }

const NewUpload = async () => {
  const { session } = await validateAuth()
  if (!session) redirect("/sign-in")
  return (
    <section className="container">
      <h1 className="font-semibold text-2xl my-6">New Upload</h1>
      <NewPostForm />
    </section>
  )
}

export default NewUpload
