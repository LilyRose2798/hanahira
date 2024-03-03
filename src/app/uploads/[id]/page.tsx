import { Metadata } from "next"
import UploadDetails from "@/components/uploads/UploadDetails"
import { api } from "@/lib/trpc/api"

const title = "Upload"
export const metadata: Metadata = { title }

const Upload = async ({ params: { id } }: { params: { id: string } }) => {
  const upload = await api.uploads.find.byId.query({ id })
  return (
    <section className="container">
      <h1 className="font-semibold text-2xl my-6">{title}</h1>
      <UploadDetails upload={upload} />
    </section>
  )
}

export default Upload
