import { generateOpenApiDocument } from "@lilyrose2798/trpc-openapi"
import { cache } from "react"
import { OpenAPIObject } from "openapi3-ts/oas31"
import { appRouter } from "@/lib/trpc/routers"
import { openApiUploadPath } from "@/app/api/upload/openapi"

export const getOpenApiDocument = cache(async (): Promise<OpenAPIObject> => generateOpenApiDocument(appRouter, {
  title: "Hanahira API",
  description: "The API for Hanahira",
  version: "0.1.0",
  openApiVersion: "3.1.0",
  baseUrl: "https://hanahira.moe/api",
  tags: ["Auth", "Account", "Users", "Posts", "Docs"],
  securitySchemes: {
    "Bearer Authorization": {
      type: "http",
      scheme: "Bearer",
    },
    "Cookie Authorization": {
      type: "apiKey",
      in: "cookie",
      name: "auth_session",
    },
  },
  paths: openApiUploadPath,
}))
