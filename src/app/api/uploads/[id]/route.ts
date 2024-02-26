import { NextRequest, NextResponse } from "next/server"
import { fileSchema } from "@/lib/db/schemas/utils"
import { replaceUpload, findUploadById, saveFile, deleteFile } from "@/lib/api/uploads"
import { api } from "@/lib/trpc/api"
import { authErrorHandle } from "@/lib/trpc/utils"
import { truncate } from "@/lib/utils"
import { Upload } from "@/lib/db/schemas/uploads"
import { APIErrorResponse } from "@/lib/api/utils"

export const PUT = async (req: NextRequest, { params: { id } }: { params: { id: string } }):
  Promise<NextResponse<Upload | APIErrorResponse>> => {
  try {
    const user = await api.account.find.current.query().catch(authErrorHandle)
    if (!user) return NextResponse.json({ code: "UNAUTHORIZED", message: "Not signed in" }, { status: 401 })
    const curUpload = await findUploadById({ id })
    if (!curUpload) return NextResponse.json({
      code: "NOT_FOUND",
      message: "Upload with provided id not found",
    }, { status: 404 })
    const formData = await req.formData()
    const fileField = formData.get("file")
    if (!fileField) return NextResponse.json({
      code: "BAD_REQUEST",
      message: "File data not provided",
    }, { status: 400 })
    const fileRes = fileSchema.safeParse(fileField)
    if (!fileRes.success) return NextResponse.json({
      code: "BAD_REQUEST",
      message: "Invalid file data provided",
      issues: fileRes.error.issues.map(e => ({
        message: e.path.length > 0 && fileField instanceof File ? `${e.message} (${truncate(fileField.name, 32)})` : e.message,
      })),
    }, { status: 400 })
    const newUpload = await replaceUpload({
      id,
      ...await saveFile(fileRes.data),
      updatedBy: user.id,
    })
    await deleteFile(curUpload.location)
    return NextResponse.json(newUpload)
  } catch (e) {
    return NextResponse.json({ code: "INTERNAL_SERVER_ERROR", message: "Unexpected server error" }, { status: 500 })
  }
}
