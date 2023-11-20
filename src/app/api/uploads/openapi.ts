import { ZodOpenApiPathsObject } from "zod-openapi"

export const openApiUploadPath: ZodOpenApiPathsObject = {
  "/uploads": {
    post: {
      summary: "Upload files",
      description: "Upload files",
      tags: ["Upload"],
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
              schema: {
                title: "File IDs",
                description: "The IDs of the uploaded files",
                type: "array",
                items: {
                  type: "string",
                  description: "A file ID",
                  example: "EGSzbSc08HBB",
                },
              },
            },
          },
        },
        400: {
          description: "Invalid file data provided",
          content: {
            "application/json": {
              schema: {
                type: "object",
                title: "Error",
                description: "The error information",
                properties: {
                  message: {
                    type: "string",
                    description: "The error message",
                    example: "Invalid file provided",
                  },
                  code: {
                    type: "string",
                    description: "The error code",
                    example: "BAD_REQUEST",
                  },
                  issues: {
                    type: "array",
                    description: "An array of issues that were responsible for the error",
                    example: [],
                    items: {
                      type: "string",
                    },
                  },
                },
                required: ["code", "message"],
                example: { code: "BAD_REQUEST", message: "Invalid file provided", issues: [] },
              },
            },
          },
        },
        500: {
          description: "Unexpected server error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                title: "Error",
                description: "The error information",
                properties: {
                  message: {
                    type: "string",
                    description: "The error message",
                    example: "Error saving files",
                  },
                  code: {
                    type: "string",
                    description: "The error code",
                    example: "INTERNAL_SERVER_ERROR",
                  },
                  issues: {
                    type: "array",
                    description: "An array of issues that were responsible for the error",
                    example: [],
                    items: {
                      type: "string",
                    },
                  },
                },
                required: ["code", "message"],
                example: { code: "INTERNAL_SERVER_ERROR", message: "Unexpected server error", issues: [] },
              },
            },
          },
        },
      },
    },
  },
}
