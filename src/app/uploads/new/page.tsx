import { Metadata } from "next"
import NewUploadForm from "@/components/uploads/NewUploadForm"
import { api } from "@/lib/trpc/api"
import { authErrorRedirect } from "@/lib/trpc/utils"
import { redirect } from "next/navigation"

const title = "New Upload"
export const metadata: Metadata = { title }
export const dynamic = "force-dynamic"

const NewUpload = async ({ searchParams }: { searchParams?: { ids?: string } }) => {
  const ids = searchParams?.ids?.split(",") ?? []
  const uploads = await api.account.find.uploadsByIdsWithPosts.query({ ids }).catch(authErrorRedirect)
  const uploadsMap = new Map(uploads.map(({ post, ...upload }) => [upload.id, post === null ? upload : { post, ...upload }]))
  const initialUploads = ids.flatMap(id => (upload => (upload ? [upload] : []))(uploadsMap.get(id)))
  if (initialUploads.length < ids.length) redirect(initialUploads.length === 0 ? "/uploads/new" : `/uploads/new?ids=${initialUploads.map(x => x.id).join(",")}`)
  return (
    <section className="container">
      <h1 className="font-semibold text-2xl my-6">{title}</h1>
      <NewUploadForm initialUploads={initialUploads} />
    </section>
  )
}

export default NewUpload
