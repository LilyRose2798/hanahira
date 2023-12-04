"use client"
import { PostWithUpload } from "@/lib/db/schemas/posts"
import { trpc } from "@/lib/trpc/client"
import PostComp from "@/components/posts/Post"

export const PostList = ({ posts }: { posts: PostWithUpload[] }) => {
  const { data } = trpc.posts.find.manyWithUpload.useQuery(undefined, { initialData: posts, refetchOnMount: false })
  return data.length === 0 ?
    <div className="text-center"><h3 className="mt-2 text-sm font-semibold text-gray-300">No posts</h3></div> :
    <ul>{data.map(post => <li className="flex justify-between my-8" key={post.id}><PostComp post={post} /></li>)}</ul>
}

export default PostList
