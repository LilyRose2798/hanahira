"use client"
import { Post } from "@/lib/db/schema/posts"
import { trpc } from "@/lib/trpc/client"
import PostModal from "@/components/posts/PostModal"

const Post = ({ post, canEdit = true }: { post: Post, canEdit?: boolean }) => (
  <li className="flex justify-between my-2">
    <div className="w-full">
      <div>{post.description}</div>
    </div>
    {canEdit && <PostModal post={post} />}
  </li>
)

const EmptyState = () => (
  <div className="text-center">
    <h3 className="mt-2 text-sm font-semibold text-gray-900">No posts</h3>
    <p className="mt-1 text-sm text-gray-500">
        Get started by creating a new post.
    </p>
    <div className="mt-6">
      <PostModal emptyState={true} />
    </div>
  </div>
)

export const PostList = ({ posts, canEdit = true }: { posts: Post[], canEdit?: boolean }) => {
  const { data } = trpc.posts.query.many.useQuery({}, { initialData: posts, refetchOnMount: false })
  if (data.length === 0) return <EmptyState />
  return <ul>{data.toReversed().map(post => <Post post={post} canEdit={canEdit} key={post.id} />)}</ul>
}

export default PostList
