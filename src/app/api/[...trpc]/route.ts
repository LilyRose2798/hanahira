import { createOpenApiFetchHandler } from "@lilyrose2798/trpc-openapi"
import { createContext } from "@/lib/trpc"
import { AppRouter, appRouter } from "@/lib/trpc/routers"

const handler = (req: Request) => createOpenApiFetchHandler<AppRouter>({
  endpoint: "/api",
  router: appRouter,
  createContext,
  req,
})

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
  handler as HEAD,
}
