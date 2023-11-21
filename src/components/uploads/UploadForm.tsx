import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { fileListSchema, maxAllowedFileSize } from "@/lib/db/schemas/utils"
import { Upload, uploadSchema } from "@/lib/db/schemas/uploads"
import { humanFileSize } from "@/lib/utils"
import { useRef } from "react"

export const UploadForm = ({ uploadComplete, filesLabel = "Files" }: {
  uploadComplete?: (uploads: Upload[]) => void, filesLabel?: string }) => {
  const { toast, onError } = useToast()
  const fileInputRef = useRef<HTMLInputElement>()

  const schema = z.object({ files: fileListSchema })
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  })

  const { mutate, isLoading } = useMutation({
    mutationFn: async ({ files }: { files: File[] }) => {
      const formData = new FormData()
      files.forEach(file => formData.append("files", file))
      return fetch("/api/uploads", {
        method: "POST",
        body: formData,
      })
    },
    onSuccess: async res => {
      const data = await res.json()
      if (res.status !== 200) throw new Error(String(data.message ?? "Unknown error occurred"))
      const uploads = uploadSchema.array().parse(data)
      toast({ title: "Success", description: "File(s) successfully uploaded" })
      form.reset()
      if (fileInputRef.current) fileInputRef.current.value = ""
      uploadComplete?.(uploads)
    },
    onError: err => (err instanceof Error ? onError(err) : onError({ message: "Unknown error occurred" })),
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(x => mutate(x))} className={"space-y-8"}>
        <FormField control={form.control} name="files" render={({ field: { value, onChange, ref, ...field } }) => (
          <FormItem>
            <FormLabel>{filesLabel}</FormLabel>
            <FormControl>
              <Input {...field} ref={e => {
                ref(e)
                fileInputRef.current = e ?? undefined
              }} type="file" multiple={true} onChange={e => onChange([...e.target.files ?? []])} />
            </FormControl>
            <FormDescription>Maximum file size: {humanFileSize(maxAllowedFileSize, false, 0)}</FormDescription>
            <FormMessage />
          </FormItem>
        )}/>
        <Button type="submit" className="mr-1" disabled={isLoading}>
          {`Upload${isLoading ? "ing..." : ""}`}
        </Button>
      </form>
    </Form>
  )
}

export default UploadForm
