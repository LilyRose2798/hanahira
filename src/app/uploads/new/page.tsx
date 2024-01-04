import { Metadata } from "next"
import NewUploadForm from "@/components/uploads/NewUploadForm"
import { api } from "@/lib/trpc/api"
import { authErrorRedirect } from "@/lib/trpc/utils"

const title = "New Upload"
export const metadata: Metadata = { title }
export const dynamic = "force-dynamic"

const NewUpload = async ({ searchParams }: { searchParams?: { ids?: string } }) => {
  const ids = searchParams?.ids?.split(",") ?? []
  const uploads = await api.account.find.uploadsByIds.query({ ids }).catch(authErrorRedirect)
  const uploadsMap = new Map(uploads.map(upload => [upload.id, upload]))
  const initialUploads = ids.flatMap(id => (upload => (upload ? [upload] : []))(uploadsMap.get(id)))
  return (
    <section className="container">
      <h1 className="font-semibold text-2xl my-6">{title}</h1>
      <NewUploadForm initialUploads={initialUploads} />
    </section>
  )
}

export default NewUpload
