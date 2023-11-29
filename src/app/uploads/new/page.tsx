import { validateAuth } from "@/lib/lucia"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import NewUploadForm from "@/components/uploads/NewUploadForm"
import { api } from "@/lib/trpc/api"
import { Upload } from "@/lib/db/schemas/uploads"

export const metadata: Metadata = { title: "New Upload" }

const NewUpload = async ({ searchParams }: { searchParams?: { ids?: string } }) => {
  const { user } = await validateAuth()
  if (!user) redirect("/sign-in")
  let initialUploads: Upload[] | undefined = undefined
  if (searchParams?.ids) {
    const ids = searchParams.ids.split(",")
    const uploads = await api.uploads.find.byIdsCreatedBy.query({ ids, createdBy: user.id })
    const uploadsMap = new Map(uploads.map(upload => [upload.id, upload]))
    initialUploads = ids.flatMap(id => (upload => (upload ? [upload] : []))(uploadsMap.get(id)))
  }
  return (
    <section className="container">
      <h1 className="font-semibold text-2xl my-6">New Upload</h1>
      <NewUploadForm initialUploads={initialUploads} />
    </section>
  )
}

export default NewUpload
