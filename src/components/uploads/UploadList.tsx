"use client"
import { Upload } from "@/lib/db/schemas/uploads"
import UploadPreview from "@/components/uploads/UploadPreview"
import Link from "next/link"

export const UploadList = ({ uploads }: { uploads: Upload[] }) => (uploads.length === 0 ?
  <div className="text-center"><h3 className="mt-2 text-sm font-semibold text-gray-300">No uploads</h3></div> :
  <div className="my-4 grid gap-2 grid-cols-[repeat(auto-fill,_minmax(10rem,_1fr))]">{uploads.map(upload => (
    <Link className="flex h-40 mx-auto items-center" href={`/uploads/${upload.id}`} key={upload.id}>
      <UploadPreview upload={upload} className="w-full h-auto max-h-40 border-2 border-indigo-400 rounded-md" />
    </Link>
  ))}</div>)

export default UploadList
