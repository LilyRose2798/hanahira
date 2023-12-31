import { initTRPC } from "@trpc/server"
import superjson from "superjson"
import { ZodError } from "zod"
import { OpenApiMeta } from "@lilyrose2798/trpc-openapi"
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"

export const createContext = async ({ req: { headers } }: FetchCreateContextFnOptions) => ({
  headers: Object.fromEntries(headers),
})

export type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().meta<OpenApiMeta>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      ...(error.cause instanceof ZodError ? { zodError: error.cause } : {}),
    },
  }),
})

export const { router, procedure } = t
