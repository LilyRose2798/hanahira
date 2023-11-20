"use client"
import UploadForm from "@/components/upload/UploadForm"
import { Upload } from "@/lib/db/schemas/uploads"
import { Post } from "@/lib/db/schemas/posts"
import PostForm from "@/components/posts/PostForm"
import Image from "next/image"
import { RefObject, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc/client"
import { useToast } from "@/components/ui/use-toast"

const PostFormItem = ({ upload, uploadDeleted, submitMapRef }: {
  upload: Upload, uploadDeleted: (upload: Upload) => void,
  submitMapRef: RefObject<Map<Upload["id"], RefObject<HTMLButtonElement>>>
}) => {
  const [post, setPost] = useState<Post>()
  const submitRef = useRef<HTMLButtonElement>(null)
  const utils = trpc.useUtils()
  const { toast, onError } = useToast()
  const { mutate: deleteUpload, isLoading: isDeleting } = trpc.uploads.delete.useMutation({
    onSuccess: upload => {
      utils.posts.query.invalidate()
      toast({ title: "Success", description: "Upload deleted!" })
      uploadDeleted(upload)
    },
    onError,
  })
  submitMapRef.current?.set(upload.id, submitRef)
  return <li className="my-8">
    <h2 className="text-l font-bold">{upload.originalName}</h2>
    <Image className="my-4" alt="" src={upload.location} width={300} height={300} />
    <PostForm upload={upload} post={post} submitRef={submitRef}
      postCreated={setPost} postUpdated={setPost} postDeleted={() => setPost(undefined)} />
    <Button className="my-4" type="button" variant="destructive" onClick={() => deleteUpload(upload)} disabled={isDeleting || !!post}>
      Delete Upload
    </Button>
  </li>
}

export const NewPostForm = () => {
  const [uploads, setUploads] = useState<Upload[]>()
  const submitMapRef = useRef<Map<Upload["id"], RefObject<HTMLButtonElement>>>(new Map())
  return uploads === undefined || uploads.length === 0 ?
    <UploadForm uploadComplete={setUploads} /> :
    <div>
      <ul>{uploads.map(upload => <PostFormItem key={upload.id} upload={upload}
        uploadDeleted={upload => setUploads(uploads.filter(x => x.id !== upload.id))} submitMapRef={submitMapRef} />)}</ul>
      <Button className="mb-8" type="submit" onClick={() => [...submitMapRef.current?.values()].map(x => x.current?.click())}>Save All Posts</Button>
    </div>
}

export default NewPostForm
