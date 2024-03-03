"use client"
import { PostWithUpload } from "@/lib/db/schemas/posts"
import UploadPreview from "@/components/uploads/UploadPreview"
import Link from "next/link"

export const PostList = ({ posts }: { posts: PostWithUpload[] }) => (posts.length === 0 ?
  <div className="text-center"><h3 className="mt-2 text-sm font-semibold text-gray-300">No posts</h3></div> :
  <div className="my-4 grid gap-2 grid-cols-[repeat(auto-fill,_minmax(10rem,_1fr))]">{posts.map(post => (
    <Link className="flex h-40 mx-auto items-center" href={`/posts/${post.id}`} key={post.id}>
      <UploadPreview upload={post.upload} className="w-full h-auto max-h-40 border-2 border-indigo-400 rounded-md" />
    </Link>
  ))}</div>)

export default PostList
