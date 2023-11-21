import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { trpc } from "@/lib/trpc/client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Post, postSchema } from "@/lib/db/schemas/posts"
import { preprocessEmptyString } from "@/lib/db/schemas/utils"
import { z } from "zod"
import { postRatingName, postRatings } from "@/lib/db/enums/postRating"
import { Upload } from "@/lib/db/schemas/uploads"
import { Ref } from "react"

export const PostForm = ({ upload, post, submitRef, setPost }: {
  upload: Upload, post?: Post, submitRef?: Ref<HTMLButtonElement>,
  setPost?: (post: Post | undefined) => void,
}) => {
  const { toast, onError } = useToast()
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

  const { mutate: createPost, isLoading: isCreating } = trpc.posts.create.useMutation({
    onSuccess: post => {
      utils.posts.query.invalidate()
      toast({ title: "Success", description: "Post created!" })
      setPost?.(post)
    },
    onError,
  })
  const { mutate: updatePost, isLoading: isUpdating } = trpc.posts.update.useMutation({
    onSuccess: post => {
      utils.posts.query.invalidate()
      toast({ title: "Success", description: "Post updated!" })
      setPost?.(post)
    },
    onError,
  })
  const { mutate: deletePost, isLoading: isDeleting } = trpc.posts.delete.useMutation({
    onSuccess: _ => {
      utils.posts.query.invalidate()
      toast({ title: "Success", description: "Post deleted!" })
      setPost?.(undefined)
    },
    onError,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(p => (editing ? updatePost({ ...p, id: post.id }) : createPost({ ...p, uploadId: upload.id })))} className={"space-y-8"}>
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
            <FormControl>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{postRatingName(field.value) ?? "Pick a rating"}</Button>
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
        <Button ref={submitRef} type="submit" className="mr-1" disabled={isCreating || isUpdating}>
          {editing ? `Updat${isUpdating ? "ing Post..." : "e Post"}` : `Creat${isCreating ? "ing Post..." : "e Post"}`}
        </Button>
        {editing ? (
          <Button type="button" variant="destructive" onClick={() => deletePost(post)} disabled={isDeleting}>
            Delet{isDeleting ? "ing Post..." : "e Post"}
          </Button>
        ) : null}
      </form>
    </Form>
  )
}

export default PostForm
