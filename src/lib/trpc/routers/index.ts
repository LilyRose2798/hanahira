import { router as r } from "@/lib/trpc"
import { accountRouter } from "@/lib/trpc/routers/account"
import { profilesRouter } from "@/lib/trpc/routers/profiles"
import { usersRouter } from "@/lib/trpc/routers/users"
import { postsRouter } from "@/lib/trpc/routers/posts"
import { authProcedures } from "@/lib/trpc/routers/auth"
import { docsProcedures } from "@/lib/trpc/routers/docs"

export const appRouter = r({
  account: accountRouter,
  profiles: profilesRouter,
  users: usersRouter,
  posts: postsRouter,
  ...authProcedures,
  ...docsProcedures,
})

export type AppRouter = typeof appRouter
