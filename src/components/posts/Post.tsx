import { postRatingName } from "@/lib/db/enums/postRating"
import { postStatusName } from "@/lib/db/enums/postStatus"
import { PostWithUpload } from "@/lib/db/schemas/posts"
import Image from "next/image"

const Post = ({ post }: { post: PostWithUpload, canEdit?: boolean }) => (
  <li className="flex justify-between my-2">
    <div className="w-full">
      <h2 className="text-l font-semibold">{post.upload.originalName}</h2>
      <Image className="my-4" alt="" src={post.upload.location} width={300} height={300} />
      <p>Description: {post.description ?? "(No description set)"}</p>
      <p>Source URL: {post.sourceUrl ?? "(No source URL set)"}</p>
      <p>Rating: {postRatingName(post.rating)}</p>
      <p>Status: {postStatusName(post.status)}</p>
      <p>Created At: {post.createdAt.toLocaleString()}</p>
    </div>
  </li>
)

export default Post
