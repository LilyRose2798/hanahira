import { Upload } from "@/lib/db/schemas/uploads"
import Image from "next/image"
import Link from "next/link"

const Upload = ({ upload }: { upload: Upload }) => (
  <div className="w-full">
    {/* <h2 className="text-l font-semibold">{upload.originalName}</h2> */}
    {upload.detectedMime?.startsWith("image/") ?
      <Image className="my-4" alt="" src={upload.location} width={300} height={300} /> :
      upload.detectedMime?.startsWith("video/") ?
        <video controls className="my-4 h-[300px]"><source src={upload.location} /></video> :
        upload.detectedMime?.startsWith("audio/") ?
          <audio controls className="my-4"><source src={upload.location} /></audio> :
          <Link href={upload.location} className="my-4">File link</Link>}
  </div>
)

export default Upload
