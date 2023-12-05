"use client"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { fileListSchema, humanMaxFileSize, maxFileCount, humanMaxTotalFileSize } from "@/lib/db/schemas/utils"
import { Upload } from "@/lib/db/schemas/uploads"
import { useRef } from "react"
import { useDropzone } from "react-dropzone"
import { truncate } from "@/lib/utils"
import { APIErrorResponse } from "@/lib/api/utils"

export const UploadForm = ({ uploadComplete, adding = false }: {
  uploadComplete?: (uploads: Upload[]) => void, adding: boolean }) => {
  const fileInputRef = useRef<HTMLInputElement>()

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
      if (res.status !== 200) {
        const e = data as APIErrorResponse
        if (e.issues) e.issues.forEach(e => toast.error(e.message))
        else toast.error(e.message)
        return
      }
      const uploads = data as Upload[]
      toast.success(`File${uploads.length > 0 ? "s" : ""} successfully uploaded`)
      if (fileInputRef.current) fileInputRef.current.value = ""
      uploadComplete?.(uploads)
    },
    onError: e => (e instanceof Error ? toast.error(e.message) : toast.error("Unexpected error occurred")),
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: files => {
      const res = fileListSchema.safeParse(files)
      if (res.success) mutate({ files: res.data })
      else res.error.issues.forEach(e => toast.error(e.path.length > 0 ?
        `${e.message} (${truncate(files[+e.path[0]].name, 32)})` : e.message))
    },
  })

  return (
    <div {...getRootProps({ className: `border border-input border-solid rounded-md text-sm p-6 ${isLoading ? "opacity-50" : "cursor-pointer"}` })}>
      <input {...getInputProps({ disabled: isLoading })} />
      <p className="text-center">{isLoading ? "Uploading..." : isDragActive ?
        "Drop the files here..." :
        `Drag and drop or click here to ${adding ? "add some more" : "select some"} files`}
      </p>
      <p className="text-center text-muted-foreground mt-2">Max file size: {humanMaxFileSize}</p>
      <p className="text-center text-muted-foreground">Max file count: {maxFileCount}</p>
      <p className="text-center text-muted-foreground">Max total file size: {humanMaxTotalFileSize}</p>
    </div>
  )
}

export default UploadForm
