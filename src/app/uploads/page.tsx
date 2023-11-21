import { validateAuth } from "@/lib/lucia"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = { title: "My Uploads" }

const Uploads = async () => {
  const { session } = await validateAuth()
  if (!session) redirect("/sign-in")
  return (
    <section className="container">
      <h1 className="font-semibold text-2xl my-6">My Uploads</h1>
      {/* <PostList posts={posts} canEdit={signedIn} /> */}
    </section>
  )
}

export default Uploads
