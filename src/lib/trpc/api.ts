import { AppRouter, appRouter } from "@/lib/trpc/routers"
import SuperJSON from "superjson"
import { createTRPCProxyClient, loggerLink, TRPCClientError } from "@trpc/client"
import { observable } from "@trpc/server/observable"
import { TRPCError, callProcedure } from "@trpc/server"
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc"
import { getHTTPStatusCodeFromError } from "@trpc/server/http"

export const api = createTRPCProxyClient<AppRouter>({
  transformer: SuperJSON,
  links: [
    loggerLink({
      enabled: op => process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    // httpBatchLink({
    //   url: getUrl(),
    //   headers: () => ({
    //     cookie: cookies().toString(),
    //     "x-trpc-source": "rsc",
    //   }),
    // }),
    () => ({ op }) => observable(observer => {
      const { type, path, input } = op
      callProcedure({
        procedures: appRouter._def.procedures,
        type,
        path,
        rawInput: input,
        ctx: { headers: {} },
      }).then(data => {
        observer.next({ result: { data } })
        observer.complete()
      }).catch(err => {
        if (err instanceof TRPCError) {
          const { message, code, stack, cause } = err
          observer.error(new TRPCClientError<AppRouter>(message, {
            result: {
              error: {
                message,
                code: TRPC_ERROR_CODES_BY_KEY[code],
                data: {
                  code,
                  httpStatus: getHTTPStatusCodeFromError(err),
                  stack,
                  path,
                  zodError: null,
                },
              },
            },
            cause,
          } as any))
        } else observer.error(TRPCClientError.from(err as any))
      })
    }),
  ],
})
