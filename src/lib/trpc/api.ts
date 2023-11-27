import { cookies } from "next/headers"
import { appRouter } from "@/lib/trpc/routers"
import { loggerLink } from "@trpc/client"
import { experimental_createTRPCNextAppDirServer as createServer } from "@trpc/next/app-dir/server"
import { experimental_nextCacheLink as nextCacheLink } from "@trpc/next/app-dir/links/nextCache"
import SuperJSON from "superjson"

export const api = createServer<typeof appRouter>({
  config() {
    return {
      transformer: SuperJSON,
      links: [
        loggerLink({ enabled: _ => true }),
        nextCacheLink({
          revalidate: 5,
          router: appRouter,
          createContext: async () => ({
            headers: {
              cookie: cookies().toString(),
              "x-trpc-source": "rsc-invoke",
            },
          }),
        }),
      ],
    }
  },
})
