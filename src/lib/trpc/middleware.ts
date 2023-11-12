import { TRPCError, experimental_standaloneMiddleware as m } from "@trpc/server"
import { Session } from "lucia"
import { findPostById } from "@/lib/api/posts"
import { UserIdParams } from "@/lib/db/schema/users"
import { PostIdParams } from "@/lib/db/schema/posts"
import { validateAuth } from "@/lib/lucia"

export const withAuth = (accessLevel: number = 1) => m()
  .create(async ({ next }) => {
    const session = await validateAuth()
    if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not signed in" })
    return next({ ctx: { session } })
  })

export const withUserOwnership = (accessLevelOverride?: number) => m<{ ctx: { session: Session }, input: UserIdParams }>()
  .create(async ({ ctx: { session }, input: { id }, next }) => {
    if (accessLevelOverride && session.user.accessLevel >= accessLevelOverride) return next()
    if (id !== session.user.userId) throw new TRPCError({ code: "FORBIDDEN", message: "Signed in user does not own user with specified ID and does not have required access level to override operation" })
    return next()
  })

export const withPostOwnership = (accessLevelOverride?: number) => m<{ ctx: { session: Session }, input: PostIdParams }>()
  .create(async ({ ctx: { session }, input: { id }, next }) => {
    const post = await findPostById({ id })
    const opts = { ctx: { session, post } }
    if (accessLevelOverride && session.user.accessLevel >= accessLevelOverride) return next(opts)
    if (post.createdBy !== session.user.userId) throw new TRPCError({ code: "FORBIDDEN", message: "Signed in user does not own post with specified ID and does not have required access level to override operation" })
    return next(opts)
  })
