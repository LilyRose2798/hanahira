import UploadList from "@/components/uploads/UploadList"
import { api } from "@/lib/trpc/api"
import { authErrorRedirect } from "@/lib/trpc/utils"
import { Metadata } from "next"

const title = "My Uploads"
export const metadata: Metadata = { title }
export const dynamic = "force-dynamic"

const Uploads = async () => {
  const uploads = await api.account.find.uploads.query().catch(authErrorRedirect)
  return (
    <section className="container">
      <h1 className="font-semibold text-2xl my-6">{title}</h1>
      <UploadList uploads={uploads} />
    </section>
  )
}

export default Uploads
