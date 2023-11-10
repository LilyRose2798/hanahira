import { createTRPCReact } from "@trpc/react-query"
import { AppRouter } from "@/lib/trpc/routers"

export const trpc = createTRPCReact<AppRouter>({})
