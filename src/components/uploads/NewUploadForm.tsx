"use client"
import { Button } from "@/components/ui/button"
import { Upload } from "@/lib/db/schemas/uploads"
import { useRef, useState, RefObject } from "react"
import { Post } from "@/lib/db/schemas/posts"
import UploadForm from "@/components/uploads/UploadForm"
import PostForm from "@/components/posts/PostForm"

type UploadRefMap = Map<Upload["id"], {
  submit: RefObject<HTMLButtonElement>,
  deleteUpload: RefObject<HTMLButtonElement>,
  deletePost: RefObject<HTMLButtonElement>,
}>

const PostFormListItem = ({ upload, uploadRefMap, uploadDeleted }: {
  upload: Upload, uploadRefMap: UploadRefMap, uploadDeleted?: (upload: Upload) => void
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

export const NewUploadForm = ({ initialUploads }: { initialUploads?: Upload[] }) => {
  const [uploads, _setUploads] = useState<Upload[]>(initialUploads ?? [])
  const setUploads = (action: (prev: Upload[]) => Upload[]) => _setUploads(prev => {
    const curr = action(prev)
    window.history.replaceState(window.history.state, "", curr.length === 0 ?
      window.location.pathname :
      `?ids=${curr.map(({ id }) => id).join(",")}`)
    return curr
  })
  const addUploads = (uploads: Upload[]) => setUploads(prev => [...prev, ...uploads])
  const remUpload = (upload: Pick<Upload, "id">) => setUploads(prev => prev?.filter(x => x.id !== upload.id))
  const uploadRefMap: UploadRefMap = new Map()
  const hasUploads = uploads.length > 0
  return <div>
    {hasUploads && <>
      <ul>
        {uploads.map(upload => <PostFormListItem key={upload.id} upload={upload} uploadRefMap={uploadRefMap} uploadDeleted={remUpload} />)}
      </ul>
      <div>
        <Button className="my-6 mr-2" type="button" onClick={() => [...uploadRefMap.values()].map(x => x.submit.current?.click())}>Save All Posts</Button>
        <Button className="mr-2" type="button" variant="destructive" onClick={() => [...uploadRefMap.values()].map(x => x.deleteUpload.current?.click())}>Delete All Uploads</Button>
        <Button type="button" variant="destructive" onClick={() => [...uploadRefMap.values()].map(x => x.deletePost.current?.click())}>Delete All Posts</Button>
      </div>
    </>}
    <UploadForm uploadComplete={addUploads} filesLabel={hasUploads ? "Add Files" : "Files"} />
  </div>
}

export default NewUploadForm
