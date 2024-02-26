import { NextRequest, NextResponse } from "next/server"
import { fileListSchema } from "@/lib/db/schemas/utils"
import { createUpload, saveFile } from "@/lib/api/uploads"
import { api } from "@/lib/trpc/api"
import { authErrorHandle } from "@/lib/trpc/utils"
import { truncate } from "@/lib/utils"
import { Upload } from "@/lib/db/schemas/uploads"
import { APIErrorResponse } from "@/lib/api/utils"

export const POST = async (req: NextRequest): Promise<NextResponse<Upload[] | APIErrorResponse>> => {
  try {
    const user = await api.account.find.current.query().catch(authErrorHandle)
    if (!user) return NextResponse.json({ code: "UNAUTHORIZED", message: "Not signed in" }, { status: 401 })
    const formData = await req.formData()
    const filesField = formData.getAll("files")
    const filesRes = fileListSchema.safeParse(filesField)
    if (!filesRes.success) return NextResponse.json({
      code: "BAD_REQUEST",
      message: "Invalid file data provided",
      issues: filesRes.error.issues.map(e => ({
        message: (e.path.length > 0 ? (f => (f instanceof File ?
          `${e.message} (${truncate(f.name, 32)})` : e.message)
        )(filesField[+e.path[0]]) : e.message),
      })),
    }, { status: 400 })
    return NextResponse.json(await Promise.all(filesRes.data.map(async file => createUpload({
      ...await saveFile(file),
      createdBy: user.id,
    }))))
  } catch (e) {
    return NextResponse.json({ code: "INTERNAL_SERVER_ERROR", message: "Unexpected server error" }, { status: 500 })
  }
}
