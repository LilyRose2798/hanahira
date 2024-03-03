import { Upload } from "@/lib/db/schemas/uploads"
import UploadPreview from "@/components/uploads/UploadPreview"
import { humanFileSize } from "@/lib/utils"
import Link from "next/link"

const UploadDetails = ({ upload }: { upload: Upload }) => (
  <div className="w-full">
    <UploadPreview upload={upload} className="w-fit h-[50vh] rounded-md my-4" />
    <p className="break-all">Original Name: {upload.originalName}</p>
    <p>Original Extension: {upload.originalExtension ?? "(No original extension set)"}</p>
    <p>Original Mime: {upload.originalMime ?? "(No original mime set)"}</p>
    <p>Detected Mime: {upload.detectedMime ?? "(No detected mime set)"}</p>
    <p className="break-all">Location: <Link href={upload.location}>{upload.location}</Link></p>
    <p>Width: {upload.width ?? "(No width set)"}</p>
    <p>Height: {upload.height ?? "(No height set)"}</p>
    <p>Size: {humanFileSize(upload.size)}</p>
    <p className="break-all">MD5 Hash: {upload.md5Hash}</p>
    <p className="break-all">SHA-256 Hash: {upload.sha256Hash}</p>
    <p className="break-all">SHA-512 Hash: {upload.sha512Hash}</p>
    <p className="break-all">Block Hash: {upload.blockHash}</p>
    <p>Created At: {upload.createdAt.toLocaleString()}</p>
  </div>
)

export default UploadDetails
