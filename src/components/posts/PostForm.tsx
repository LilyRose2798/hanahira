import { Post, updatePostSchema } from "@/lib/db/schema/posts"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { trpc } from "@/lib/trpc/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"

export const PostForm = ({ post, closeModal }: { post?: Post, closeModal: () => void }) => {
  const { toast, onError } = useToast()
  const editing = !!post?.id
  const router = useRouter()
  const utils = trpc.useUtils()
  const schema = updatePostSchema.partial().omit({ id: true, createdBy: true, createdAt: true })
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: post?.description ?? "",
      sourceUrl: post?.sourceUrl ?? "",
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
      <form onSubmit={form.handleSubmit(p => (editing ? updatePost({ ...p, id: post.id }) : createPost(p)))} className={"space-y-8"}>
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
        <Button type="submit" className="mr-1" disabled={isCreating || isUpdating}>
          {editing ? `Sav${isUpdating ? "ing..." : "e"}` : `Creat${isCreating ? "ing..." : "e"}`}
        </Button>
        {editing ? (
          <Button type="button" variant={"destructive"} onClick={() => deletePost(post)}>
            Delet{isDeleting ? "ing..." : "e"}
          </Button>
        ) : null}
      </form>
    </Form>
  )
}

export default PostForm
