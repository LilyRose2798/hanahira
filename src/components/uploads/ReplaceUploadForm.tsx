"use client"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { fileSchema } from "@/lib/db/schemas/utils"
import { Upload } from "@/lib/db/schemas/uploads"
import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { truncate } from "@/lib/utils"
import { APIErrorResponse } from "@/lib/api/utils"
import { Button } from "@/components/ui/button"
import { ReplaceIcon } from "lucide-react"
import UploadPreview from "@/components/uploads/UploadPreview"

export const ReplaceUploadForm = ({ upload, uploadReplaced }: {
  upload: Upload, uploadReplaced?: (upload: Upload) => void }) => {
  const [uploadProgress, setUploadProgress] = useState(0)

  const { mutate, isLoading } = useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      const formData = new FormData()
      formData.append("file", file)
      return new Promise<{ status: number, body: string }>((resolve, reject) => {
        const x = new XMLHttpRequest()
        x.upload.addEventListener("progress", e => e.lengthComputable && setUploadProgress(e.loaded / e.total))
        x.addEventListener("load", () => resolve({ status: x.status, body: x.responseText }))
        x.addEventListener("error", () => reject(new Error("File upload failed")))
        x.addEventListener("abort", () => reject(new Error("File upload aborted")))
        x.open("PUT", `/api/uploads/${upload.id}`, true)
        x.send(formData)
      })
    },
    onSuccess: async res => {
      const data = JSON.parse(res.body)
      if (res.status !== 200) {
        const e = data as APIErrorResponse
        if (e.issues && e.issues.length > 0) e.issues.forEach(e => toast.error(e.message))
        else toast.error(e.message)
        return
      }
      const newUpload = data as Upload
      uploadReplaced?.(newUpload)
      toast.success("File successfully replaced for upload")
    },
    onError: e => (e instanceof Error ? toast.error(e.message) : toast.error("Unexpected error occurred")),
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files, rejects) => {
      if (rejects.length > 1) {
        toast.error("Only one file allowed")
        return
      }
      const [file] = files
      const res = fileSchema.safeParse(file)
      if (res.success) mutate({ file: res.data })
      else res.error.issues.forEach(e => toast.error(e.path.length > 0 ?
        `${e.message} (${truncate(file.name, 32)})` : e.message))
    },
    disabled: isLoading,
    multiple: false,
  })

  return (
    <div {...getRootProps({ className: `w-fit relative border border-input border-solid rounded-md text-sm p-6 ${isLoading ? "" : "cursor-pointer"}` }) }>
      <UploadPreview upload={upload} className="w-full h-60 rounded-md" />
      <Button type="button" className="mt-4">
        <ReplaceIcon className="h-4 mr-2" />Replace Upload
      </Button>
      <input {...getInputProps({ disabled: isLoading })} />
      {isLoading && <progress max={1} value={uploadProgress} className="absolute inset-0 w-full h-full m-0 p-0 -z-50 [&::-webkit-progress-bar]:rounded-md [&::-webkit-progress-value]:rounded-md [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-input"></progress>}
      {(isDragActive || isLoading) && <div className="absolute inset-0 w-full h-full rounded-md bg-black/85 text-white">
        <div className="flex justify-center items-center w-full h-full rounded-md"><p>{isLoading ? (uploadProgress === 1 ?
          "Uploading 100% completed! Processing upload..." :
          `Uploading ${Math.round(uploadProgress * 100)}% completed...`
        ) : isDragActive ? "Drop the new file here..." : ""}</p></div>
      </div>}
    </div>
  )
}

export default ReplaceUploadForm
