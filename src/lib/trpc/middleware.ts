import { TRPCError, experimental_standaloneMiddleware as m } from "@trpc/server"
import { findPostById } from "@/lib/api/posts"
import { User, UserIdParams } from "@/lib/db/schemas/users"
import { PostIdParams } from "@/lib/db/schemas/posts"
import { UserRole, hasUserRole } from "@/lib/db/enums/userRole"
import { validateAuth } from "@/lib/lucia"

export const hasAuth = m()
  .create(async ({ next, ...opts }) => {
    const { session, user } = await validateAuth(opts.type === "mutation")
    if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not signed in" })
    return next({ ...opts, ctx: { ...opts.ctx, session, user } })
  })

export const hasRole = (userRole: UserRole) => m<{ ctx: { user: User } }>()
  .create(async ({ ctx, next }) => {
    if (hasUserRole(ctx.user.role, userRole)) throw new TRPCError({ code: "FORBIDDEN", message: "Signed in user does not have the required role" })
    return next()
  })

export const canEditUser = m<{ ctx: { user: User }, input: UserIdParams }>()
  .create(async ({ ctx, input: { id }, next }) => {
    if (hasUserRole(ctx.user.role, "SITE_MODERATOR")) return next()
    if (id !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Signed in user does not own user with specified ID and does not have required access level to override operation" })
    return next()
  })

export const canEditPost = m<{ ctx: { user: User }, input: PostIdParams }>()
  .create(async ({ ctx, next, ...opts }) => {
    const post = await findPostById({ id: opts.input.id })
    if (hasUserRole(ctx.user.role, "POST_EDITOR")) return next({ ...opts, ctx: { ...ctx, post } })
    if (post.createdBy !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Signed in user does not own post with specified ID and does not have required access level to override operation" })
    return next({ ...opts, ctx: { ...ctx, post } })
  })
