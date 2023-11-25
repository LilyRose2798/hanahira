import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { cwd } from "process"
import { join, extname } from "path"
import { fileListSchema } from "@/lib/db/schemas/utils"
import { createUpload } from "@/lib/api/uploads"
import { FileExtension, fileTypeFromBuffer } from "file-type"
import { nanoid } from "nanoid"
import { validateAuth } from "@/lib/lucia"
import { bmvbhash } from "@/lib/blockhash"
import { createHash } from "crypto"
import { decode as decodeJpeg } from "jpeg-js"
import { PNG } from "pngjs"
import { decode as decodeWebp } from "@jsquash/webp"
import decodeGif from "decode-gif"

const createHashCreator = (algorithm: string) => (buffer: Buffer) => createHash(algorithm, { encoding: "hex" }).update(buffer).digest("hex")
const createMD5Hash = createHashCreator("md5")
const createSHA256Hash = createHashCreator("sha256")
const createSHA512Hash = createHashCreator("sha512")

type DecodedData = Parameters<typeof bmvbhash>[0]
const decoders: Partial<Record<FileExtension, (buffer: Buffer) => DecodedData | Promise<DecodedData>>> = {
  jpg: decodeJpeg,
  png: PNG.sync.read,
  webp: decodeWebp,
  gif: buffer => {
    const { width, height, frames: [{ data }] } = decodeGif(buffer)
    return { width, height, data }
  },
}

export const POST = async (req: NextRequest) => {
  try {
    const { user } = await validateAuth()
    if (!user) return NextResponse.json({ code: "UNAUTHORIZED", message: "Not signed in" }, { status: 401 })
    const createdBy = user.id
    const formData = await req.formData()
    const filesRes = fileListSchema.safeParse(formData.getAll("files"))
    if (!filesRes.success) return NextResponse.json({ code: "BAD_REQUEST", message: filesRes.error.issues.map(x => x.message).join(", ") }, { status: 400 })
    return NextResponse.json(await Promise.all(filesRes.data.map(async file => {
      const { size, name: originalName, type: originalMime } = file
      const originalExtension = extname(originalName).substring(1) || undefined
      const buffer = Buffer.from(await file.arrayBuffer())
      const { ext: detectedExtension, mime: detectedMime } = await fileTypeFromBuffer(buffer) ?? {}
      const filenameId = nanoid(20)
      const filename = detectedExtension ? `${filenameId}.${detectedExtension}` : filenameId
      const location = `/uploads/${filename}`
      const md5Hash = createMD5Hash(buffer)
      const sha256Hash = createSHA256Hash(buffer)
      const sha512Hash = createSHA512Hash(buffer)
      const decoder = detectedExtension && decoders[detectedExtension]
      const decodedData = await decoder?.(buffer)
      const { width, height } = decodedData ?? {}
      const blockHash = decodedData && bmvbhash(decodedData, 16)
      const upload = await createUpload({
        location,
        originalName,
        originalExtension,
        originalMime,
        detectedExtension,
        detectedMime,
        md5Hash,
        sha256Hash,
        sha512Hash,
        blockHash,
        width,
        height,
        size,
        createdBy,
      })
      await writeFile(join(cwd(), "public/uploads", filename), buffer)
      return upload
    })))
  } catch (e) {
    return NextResponse.json({ code: "INTERNAL_SERVER_ERROR", message: "Unexpected server error" }, { status: 500 })
  }
}
