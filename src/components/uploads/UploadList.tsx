"use client"
import { Upload } from "@/lib/db/schemas/uploads"
import { trpc } from "@/lib/trpc/client"
import UploadComp from "@/components/uploads/Upload"

export const UploadList = ({ uploads }: { uploads: Upload[] }) => {
  const { data } = trpc.account.find.uploads.useQuery(undefined, { initialData: uploads, refetchOnMount: false })
  return data.length === 0 ?
    <div className="text-center"><h3 className="mt-2 text-sm font-semibold text-gray-300">No posts</h3></div> :
    <ul>{data.map(upload => <li className="flex justify-between my-8" key={upload.id}><UploadComp upload={upload} /></li>)}</ul>
}

export default UploadList
