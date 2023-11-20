"use client"
import UploadForm from "@/components/upload/UploadForm"
import { Upload } from "@/lib/db/schemas/uploads"
import PostForm from "@/components/posts/PostForm"
import Image from "next/image"
import { useState } from "react"

export const NewPostForm = () => {
  const [uploads, setUploads] = useState<Upload[]>()
  return uploads === undefined ?
    <UploadForm uploadComplete={setUploads} /> :
    <div>{uploads.map(upload => <div key={upload.id}>
      <Image alt="" src={upload.url} width={300} height={300} />
      <PostForm closeModal={() => {}} upload={upload} />
    </div>)}</div>
}

export default NewPostForm
