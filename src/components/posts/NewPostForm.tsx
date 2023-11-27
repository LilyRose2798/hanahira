"use client"
import UploadForm from "@/components/uploads/UploadForm"
import { Upload } from "@/lib/db/schemas/uploads"
import { Post } from "@/lib/db/schemas/posts"
import PostForm from "@/components/posts/PostForm"

import { RefObject, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

type UploadRefMap = Map<Upload["id"], {
  submit: RefObject<HTMLButtonElement>,
  deleteUpload: RefObject<HTMLButtonElement>,
  deletePost: RefObject<HTMLButtonElement>,
}>

const PostFormItem = ({ upload, uploadDeleted, uploadRefMap }: {
  upload: Upload, uploadDeleted?: (upload: Upload) => void,
  uploadRefMap: UploadRefMap
}) => {
  const [post, setPost] = useState<Post>()

  const submitRef = useRef<HTMLButtonElement>(null)
  const deleteUploadRef = useRef<HTMLButtonElement>(null)
  const deletePostRef = useRef<HTMLButtonElement>(null)
  uploadRefMap.set(upload.id, { submit: submitRef, deleteUpload: deleteUploadRef, deletePost: deletePostRef })

  return <li className="my-8">
    <PostForm {...{ upload, post, uploadDeleted, setPost, submitRef, deleteUploadRef, deletePostRef }} />
  </li>
}

export const NewPostForm = () => {
  const [uploads, setUploads] = useState<Upload[]>()
  const uploadRefMap: UploadRefMap = new Map()
  const hasUploads = uploads !== undefined && uploads.length > 0
  return <div>
    {hasUploads && <ul>{uploads.map(upload => <PostFormItem key={upload.id} upload={upload}
      uploadDeleted={upload => setUploads(prev => prev?.filter(x => x.id !== upload.id))} uploadRefMap={uploadRefMap} />)}</ul>}
    <UploadForm uploadComplete={hasUploads ? x => setUploads([...uploads, ...x]) : setUploads} filesLabel={hasUploads ? "Add Files" : "Files"} />
    {hasUploads && <div>
      <Button className="my-6 mr-2" type="button" onClick={() => [...uploadRefMap.values()].map(x => x.submit.current?.click())}>Save All Posts</Button>
      <Button className="mr-2" type="button" variant="destructive" onClick={() => [...uploadRefMap.values()].map(x => x.deleteUpload.current?.click())}>Delete All Uploads</Button>
      <Button type="button" variant="destructive" onClick={() => [...uploadRefMap.values()].map(x => x.deletePost.current?.click())}>Delete All Posts</Button>
    </div>}
  </div>
}

export default NewPostForm
