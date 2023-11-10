import { procedure as p } from "@/lib/trpc"
import { z } from "zod"
import { getOpenApiDocument } from "@/lib/trpc/openapi"

export const docsProcedures = {
  openApiJson: p
    .meta({ openapi: {
      method: "GET",
      path: "/openapi.json",
      tags: ["Docs"],
      summary: "Get the Hanahira OpenApi JSON specification",
      description: "Get the Hanahira OpenApi JSON specification",
      successDescription: "Hanahira OpenApi JSON Specification successfully returned",
      errorResponses: {
        500: "Unexpected server error",
      },
    } })
    .input(z.void())
    .output(z.any().openapi({
      description: "The Hanahira OpenApi JSON specification",
      example: "The Hanahira OpenApi JSON specification",
    })).query(() => getOpenApiDocument()),
}
