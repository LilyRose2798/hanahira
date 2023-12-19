import { router as r, procedure as p } from "@/lib/trpc"
import { hasAuth } from "@/lib/trpc/middleware"
import { queryUploads, queryUploadById, replaceUpload, updateUpload, deleteUpload, findUploads, findUploadById } from "@/lib/api/uploads"
import { uploadSchema, partialUploadSchema, uploadIdSchema, queryUploadsSchema, queryUploadIdSchema, replaceUploadSchema, updateUploadSchema } from "@/lib/db/schemas/uploads"

export const tags = ["Uploads"]

export const uploadsRouter = r({
  find: r({
    many: p.query(async () => findUploads({})),
    byId: p.input(uploadIdSchema).query(async ({ input }) => findUploadById(input)),
  }),
  query: r({
    many: p
      .meta({ openapi: {
        method: "GET",
        path: "/uploads",
        tags,
        summary: "Query upload data",
        description: "Query the data of uploads",
        successDescription: "Upload data successfully returned",
        errorResponses: {
          400: "Invalid upload data",
          500: "Unexpected server error",
        },
      } })
      .input(queryUploadsSchema)
      .output(partialUploadSchema.array())
      .query(async ({ input }) => queryUploads(input)),
    byId: p
      .meta({ openapi: {
        method: "GET",
        path: "/uploads/{id}",
        tags,
        summary: "Query an upload's data",
        description: "Query the data of the upload with the specified ID",
        successDescription: "Upload data successfully returned",
        errorResponses: {
          400: "Invalid upload ID",
          404: "Upload not found with specified ID",
          500: "Unexpected server error",
        },
      } })
      .input(queryUploadIdSchema)
      .output(partialUploadSchema)
      .query(async ({ input }) => queryUploadById(input)),
  }),
  replace: p
    .meta({ openapi: {
      method: "PUT",
      path: "/uploads/{id}",
      tags,
      summary: "Replace an upload's data",
      description: "Replace the data of the upload with the specified ID",
      protect: true,
      successDescription: "Upload data successfully replaced",
      errorResponses: {
        400: "Invalid upload data",
        401: "Not signed in",
        404: "Upload not found",
        500: "Unexpected server error",
      },
    } })
    .use(hasAuth)
    .input(replaceUploadSchema)
    .output(uploadSchema)
    .mutation(async ({ input, ctx: { session: { createdBy: updatedBy } } }) => (
      replaceUpload({ ...input, updatedBy }))),
  update: p
    .meta({ openapi: {
      method: "PATCH",
      path: "/uploads/{id}",
      tags,
      summary: "Update an upload's data",
      description: "Update the data of the upload with the specified ID",
      protect: true,
      successDescription: "Upload data successfully updated",
      errorResponses: {
        400: "Invalid upload data",
        401: "Not signed in",
        404: "Upload not found",
        500: "Unexpected server error",
      },
    } })
    .use(hasAuth)
    .input(updateUploadSchema)
    .output(uploadSchema)
    .mutation(async ({ input, ctx: { session: { createdBy: updatedBy } } }) => (
      updateUpload({ ...input, updatedBy }))),
  delete: p
    .meta({ openapi: {
      method: "DELETE",
      path: "/uploads/{id}",
      tags,
      summary: "Delete an upload",
      description: "Delete the upload with the specified ID",
      protect: true,
      successDescription: "Upload successfully Deleted",
      errorResponses: {
        400: "Invalid upload ID",
        401: "Not signed in",
        404: "Upload not found",
        500: "Unexpected server error",
      },
    } })
    .use(hasAuth)
    .input(uploadIdSchema)
    .output(uploadSchema)
    .mutation(async ({ input }) => deleteUpload(input)),
})
