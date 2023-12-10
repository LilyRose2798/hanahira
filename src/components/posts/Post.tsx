import { postRatingName } from "@/lib/db/enums/post-rating"
import { postStatusName } from "@/lib/db/enums/post-status"
import { PostWithUpload } from "@/lib/db/schemas/posts"
import Upload from "@/components/uploads/Upload"

const Post = ({ post }: { post: PostWithUpload }) => (
  <div className="w-full">
    <Upload upload={post.upload} />
    <p>Description: {post.description ?? "(No description set)"}</p>
    <p>Source URL: {post.sourceUrl ?? "(No source URL set)"}</p>
    <p>Rating: {postRatingName(post.rating)}</p>
    <p>Status: {postStatusName(post.status)}</p>
    <p>Created At: {post.createdAt.toLocaleString()}</p>
  </div>
)

export default Post
