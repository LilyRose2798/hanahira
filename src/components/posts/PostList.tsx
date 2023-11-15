"use client"
import { Post } from "@/lib/db/schemas/posts"
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

const EmptyState = ({ canEdit = true }: { canEdit?: boolean }) => (
  <div className="text-center">
    <h3 className="mt-2 text-sm font-semibold text-gray-300">No posts</h3>
    {canEdit ? <>
      <p className="mt-1 text-sm text-gray-300">
          Get started by creating a new post.
      </p>
      <div className="mt-6">
        <PostModal emptyState={true} />
      </div>
    </> : <p className="mt-1 text-sm text-gray-300">
        Sign in to create a new post.
    </p>}
  </div>
)

export const PostList = ({ posts, canEdit = true }: { posts: Post[], canEdit?: boolean }) => {
  const { data } = trpc.posts.query.many.useQuery({}, { initialData: posts, refetchOnMount: false })
  if (data.length === 0) return <EmptyState canEdit={canEdit} />
  return <ul>{data.toReversed().map(post => <Post post={post} canEdit={canEdit} key={post.id} />)}</ul>
}

export default PostList
