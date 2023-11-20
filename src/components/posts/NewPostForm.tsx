"use client"
import UploadForm from "@/components/upload/UploadForm"
import { Upload } from "@/lib/db/schemas/uploads"
import { Post } from "@/lib/db/schemas/posts"
import PostForm from "@/components/posts/PostForm"
import Image from "next/image"
import { RefObject, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

const PostFormItem = ({ upload, submitMapRef }: { upload: Upload, submitMapRef: RefObject<Map<Upload["id"], RefObject<HTMLButtonElement>>> }) => {
  const [post, setPost] = useState<Post>()
  const submitRef = useRef<HTMLButtonElement>(null)
  submitMapRef.current?.set(upload.id, submitRef)
  return <li className="my-8">
    <h2 className="text-l font-bold">{upload.originalName}</h2>
    <Image className="my-4" alt="" src={upload.location} width={300} height={300} />
    <PostForm upload={upload} post={post} submitRef={submitRef}
      postCreated={setPost} postUpdated={setPost} postDeleted={() => setPost(undefined)} />
  </li>
}

export const NewPostForm = () => {
  const [uploads, setUploads] = useState<Upload[]>()
  const submitMapRef = useRef<Map<Upload["id"], RefObject<HTMLButtonElement>>>(new Map())
  return uploads === undefined ?
    <UploadForm uploadComplete={setUploads} /> :
    <div>
      <ul>{uploads.map(upload => <li key={upload.id}>
        <PostFormItem upload={upload} submitMapRef={submitMapRef} />
        <Button type="button" variant="destructive">Cancel</Button>
      </li>)}</ul>
      <Button className="my-8" type="submit" onClick={() => [...submitMapRef.current?.values()].map(x => x.current?.click())}>Save All Posts</Button>
    </div>
}

export default NewPostForm
