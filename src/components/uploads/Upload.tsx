import { Upload } from "@/lib/db/schemas/uploads"
import Image from "next/image"

const Upload = ({ upload }: { upload: Upload }) => (
  <div className="w-full">
    <h2 className="text-l font-semibold">{upload.originalName}</h2>
    <Image className="my-4" alt="" src={upload.location} width={300} height={300} />
  </div>
)

export default Upload
