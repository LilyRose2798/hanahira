"use client"
import UploadForm from "@/components/upload/UploadForm"
import Image from "next/image"
import { useState } from "react"

export const NewPostForm = () => {
  const [fileIds, setFileIds] = useState<string[]>()
  return fileIds === undefined ?
    <UploadForm uploadComplete={setFileIds} /> :
    <div>{fileIds.map(x => <Image key={x} alt="" src={`/uploads/${x}`} width={300} height={300} />)}</div>
}

export default NewPostForm
