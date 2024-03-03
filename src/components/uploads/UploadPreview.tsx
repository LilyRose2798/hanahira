import { Upload } from "@/lib/db/schemas/uploads"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

const UploadPreview = ({ upload, className = "" }: { upload: Upload, className?: string }) => (
  upload.detectedMime?.startsWith("image/") ?
    <Image className={className} alt="" src={upload.location} width={300} height={300} /> :
    upload.detectedMime?.startsWith("video/") ?
      <video controls className={className}><source src={upload.location} /></video> :
      upload.detectedMime?.startsWith("audio/") ?
        <audio controls className={cn(className, "w-96 h-12")}><source src={upload.location} /></audio> :
        <Link href={upload.location} className={cn(className, "w-96 h-fit block")}>{upload.originalName}</Link>)

export default UploadPreview
