import { postRatingName } from "@/lib/db/enums/postRating"
import { postStatusName } from "@/lib/db/enums/postStatus"
import { Post } from "@/lib/db/schemas/posts"

const Post = ({ post }: { post: Post, canEdit?: boolean }) => (
  <li className="flex justify-between my-2">
    <div className="w-full">
      <p>Description: {post.description ?? "(No description set)"}</p>
      <p>Source URL: {post.sourceUrl ?? "(No source URL set)"}</p>
      <p>Rating: {postRatingName(post.rating)}</p>
      <p>Status: {postStatusName(post.status)}</p>
      <p>Created At: {post.createdAt.toLocaleString()}</p>
    </div>
  </li>
)

export default Post
