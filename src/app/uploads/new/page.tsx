import { validateAuth } from "@/lib/lucia"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import NewUploadForm from "@/components/uploads/NewUploadForm"
import { api } from "@/lib/trpc/api"

export const metadata: Metadata = { title: "New Upload" }

const NewUpload = async ({ searchParams }: { searchParams?: { ids?: string } }) => {
  const { user } = await validateAuth()
  if (!user) redirect("/sign-in")
  const ids = searchParams?.ids
  const initialUploads = ids ? await api.uploads.find.byIdsCreatedBy.query({ ids: ids.split(","), createdBy: user.id }) : undefined
  return (
    <section className="container">
      <h1 className="font-semibold text-2xl my-6">New Upload</h1>
      <NewUploadForm initialUploads={initialUploads} />
    </section>
  )
}

export default NewUpload
