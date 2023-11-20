import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { trpc } from "@/lib/trpc/client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Post, postSchema } from "@/lib/db/schemas/posts"
import { preprocessEmptyString } from "@/lib/db/schemas/utils"
import { z } from "zod"
import { postRatingName, postRatings } from "@/lib/db/enums/postRating"
import { Upload } from "@/lib/db/schemas/uploads"

export const PostForm = ({ closeModal, ...props }: { post: Post, closeModal: () => void } | { upload: Upload, closeModal: () => void }) => {
  const { toast, onError } = useToast()
  const editing = "post" in props
  const router = useRouter()
  const utils = trpc.useUtils()
  const schema = z.object({
    description: preprocessEmptyString(postSchema.shape.description),
    sourceUrl: preprocessEmptyString(postSchema.shape.sourceUrl),
    rating: preprocessEmptyString(postSchema.shape.rating),
  })
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: editing ? props.post.description : "",
      sourceUrl: editing ? props.post.sourceUrl : "",
      rating: editing ? props.post.rating : undefined,
    },
  })

  const onSuccess = (action: "create" | "update" | "delete") => {
    toast({ title: "Success", description: `Post ${action}d!` })
    utils.posts.query.invalidate()
    router.refresh()
    closeModal()
  }

  const { mutate: createPost, isLoading: isCreating } = trpc.posts.create.useMutation({ onSuccess: () => onSuccess("create"), onError })
  const { mutate: updatePost, isLoading: isUpdating } = trpc.posts.update.useMutation({ onSuccess: () => onSuccess("update"), onError })
  const { mutate: deletePost, isLoading: isDeleting } = trpc.posts.delete.useMutation({ onSuccess: () => onSuccess("delete"), onError })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(p => (editing ? updatePost({ ...p, id: props.post.id }) : createPost({ ...p, uploadId: props.upload.id })))} className={"space-y-8"}>
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
                  <Button variant="outline">{field.value ?? "Pick a rating"}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Post Rating</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup defaultValue={field.value ?? undefined} onValueChange={field.onChange}>
                    {postRatings.map(r => <DropdownMenuRadioItem key={r} value={r}>{postRatingName(r)}</DropdownMenuRadioItem>)}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Input {...field} type="" value={field.value ?? undefined} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        <Button type="submit" className="mr-1" disabled={isCreating || isUpdating}>
          {editing ? `Sav${isUpdating ? "ing..." : "e"}` : `Creat${isCreating ? "ing..." : "e"}`}
        </Button>
        {editing ? (
          <Button type="button" variant={"destructive"} onClick={() => deletePost(props.post)}>
            Delet{isDeleting ? "ing..." : "e"}
          </Button>
        ) : null}
      </form>
    </Form>
  )
}

export default PostForm
