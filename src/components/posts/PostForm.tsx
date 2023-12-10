import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { trpc } from "@/lib/trpc/client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Post, postSchema } from "@/lib/db/schemas/posts"
import { preprocessEmptyString } from "@/lib/db/schemas/utils"
import { z } from "zod"
import { postRatingName, postRatings } from "@/lib/db/enums/post-rating"
import { Upload } from "@/lib/db/schemas/uploads"
import { Ref } from "react"
import UploadComp from "@/components/uploads/Upload"
import Link from "next/link"

export const PostForm = ({ upload, post, uploadDeleted, setPost, submitRef, deleteUploadRef, deletePostRef }: {
  upload: Upload, post?: Post, setPost?: (post: Post | undefined) => void, uploadDeleted?: (upload: Upload) => void,
  submitRef?: Ref<HTMLButtonElement>, deleteUploadRef?: Ref<HTMLButtonElement>, deletePostRef?: Ref<HTMLButtonElement>,
}) => {
  const editing = !!post?.id
  const utils = trpc.useUtils()
  const schema = z.object({
    description: preprocessEmptyString(postSchema.shape.description),
    sourceUrl: preprocessEmptyString(postSchema.shape.sourceUrl),
    rating: preprocessEmptyString(postSchema.shape.rating),
  })
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: post?.description ?? "",
      sourceUrl: post?.sourceUrl ?? "",
      rating: post?.rating,
    },
  })

  const onSuccess = (action: "crea" | "upda" | "dele") => (post: Post) => {
    utils.posts.query.invalidate()
    toast.success(`Post ${action}ted`)
    setPost?.(action === "dele" ? undefined : post)
  }

  const { mutate: createPost, isLoading: isCreating } = trpc.posts.create.useMutation({ onSuccess: onSuccess("crea") })
  const { mutate: updatePost, isLoading: isUpdating } = trpc.posts.update.useMutation({ onSuccess: onSuccess("upda") })
  const { mutate: deletePost, isLoading: isDeletingPost } = trpc.posts.delete.useMutation({ onSuccess: onSuccess("dele") })
  const { mutate: deleteUpload, isLoading: isDeletingUpload } = trpc.uploads.delete.useMutation({
    onSuccess: upload => {
      utils.uploads.query.invalidate()
      toast.success("Upload deleted")
      uploadDeleted?.(upload)
    },
    onError: e => {
      if (e.data?.httpStatus === 404) {
        toast.error("Upload already deleted")
        uploadDeleted?.(upload)
      } else toast.error(e.message)
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(p => (editing ? updatePost({ ...p, id: post.id }) : createPost({ ...p, uploadId: upload.id })))} className={"space-y-8"}>
        <UploadComp upload={upload} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? undefined} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        <FormField control={form.control} name="sourceUrl" render={({ field }) => (
          <FormItem>
            <FormLabel>Source Url</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? undefined} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        <FormField control={form.control} name="rating" render={({ field }) => (
          <FormItem>
            <FormLabel>Rating</FormLabel>
            <FormControl>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="block" variant="outline">{postRatingName(field.value) ?? "Pick a rating"}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Rating</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={field.value} onValueChange={field.onChange}>
                    {postRatings.map(r => <DropdownMenuRadioItem key={r} value={r}>{postRatingName(r)}</DropdownMenuRadioItem>)}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        {editing && <div><Link href={`/posts/${post.id}`}>View Post</Link></div>}
        <Button ref={submitRef} type="submit" className="mr-2" disabled={isCreating || isUpdating}>
          {editing ? `Updat${isUpdating ? "ing Post..." : "e Post"}` : `Creat${isCreating ? "ing Post..." : "e Post"}`}
        </Button>
        {editing ?
          <Button ref={deletePostRef} type="button" variant="destructive" onClick={() => deletePost({ id: post.id })} disabled={isDeletingPost}>
            Delet{isDeletingPost ? "ing Post..." : "e Post"}
          </Button> :
          <Button ref={deleteUploadRef} className="my-4" type="button" variant="destructive" onClick={() => deleteUpload({ id: upload.id })} disabled={isDeletingUpload}>
          Delet{isDeletingUpload ? "ing Upload..." : "e Upload"}
          </Button>}
      </form>
    </Form>
  )
}

export default PostForm
