import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { cwd } from "process"
import { join } from "path"
import { nanoid } from "@/lib/db"
import { fileListSchema } from "@/lib/db/schema/utils"

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData()
    const filesRes = fileListSchema.safeParse(formData.getAll("files"))
    if (!filesRes.success) return NextResponse.json({ code: "BAD_REQUEST", message: filesRes.error.issues.map(x => x.message).join(", ") }, { status: 400 })
    return NextResponse.json(await Promise.all(filesRes.data.map(async file => {
      const buffer = Buffer.from(await file.arrayBuffer())
      const id = nanoid()
      await writeFile(join(cwd(), "public/uploads", id), buffer) // replace with upload to S3 bucket
      return id
    })))
  } catch (e) {
    return NextResponse.json({ code: "INTERNAL_SERVER_ERROR", message: "Unexpected server error" }, { status: 500 })
  }
}
