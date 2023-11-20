"use client"
import UploadForm from "@/components/upload/UploadForm"
import { Upload } from "@/lib/db/schemas/uploads"
import Image from "next/image"
import { useState } from "react"

export const NewPostForm = () => {
  const [uploads, setUploads] = useState<Upload[]>()
  return uploads === undefined ?
    <UploadForm uploadComplete={setUploads} /> :
    <div>{uploads.map(({ id, url }) => <Image key={id} alt="" src={url} width={300} height={300} />)}</div>
}

export default NewPostForm
