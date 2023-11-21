import { uploadSchema } from "@/lib/db/schemas/uploads"
import { errorResponseFromMessage, errorResponseFromStatusCode } from "@lilyrose2798/trpc-openapi"
import { ZodOpenApiPathsObject } from "zod-openapi"

export const openApiUploadPath: ZodOpenApiPathsObject = {
  "/uploads": {
    post: {
      summary: "Upload files",
      description: "Upload files",
      tags: ["Uploads"],
      security: [{ "Bearer Authorization": [] }, { "Cookie Authorization": [] }],
      requestBody: {
        required: true,
        description: "The files to upload",
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              description: "The form data containing the files",
              properties: {
                files: {
                  type: "array",
                  description: "An array of files",
                  items: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
              required: ["files"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Files saved successfully",
          content: {
            "application/json": {
              schema: uploadSchema.array(),
            },
          },
        },
        400: errorResponseFromMessage(400, "Invalid file data provided"),
        500: errorResponseFromStatusCode(500),
      },
    },
  },
}
