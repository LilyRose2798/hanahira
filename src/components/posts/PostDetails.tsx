import { postRatingName } from "@/lib/db/enums/post-rating"
import { postStatusName } from "@/lib/db/enums/post-status"
import { PostWithUpload } from "@/lib/db/schemas/posts"
import UploadPreview from "@/components/uploads/UploadPreview"

const PostDetails = ({ post }: { post: PostWithUpload }) => (
  <div className="w-full">
    <UploadPreview upload={post.upload} className="w-fit h-[50vh] rounded-md my-4" />
    <p>Description: {post.description ?? "(No description set)"}</p>
    <p>Source URL: {post.sourceUrl ?? "(No source URL set)"}</p>
    <p>Rating: {postRatingName(post.rating)}</p>
    <p>Status: {postStatusName(post.status)}</p>
    <p>Created At: {post.createdAt.toLocaleString()}</p>
  </div>
)

export default PostDetails
