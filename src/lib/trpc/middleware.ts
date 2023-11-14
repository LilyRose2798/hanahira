import { TRPCError, experimental_standaloneMiddleware as m } from "@trpc/server"
import { Session } from "lucia"
import { findPostById } from "@/lib/api/posts"
import { UserIdParams, Role, hasRole as _hasRole } from "@/lib/db/schema/users"
import { PostIdParams } from "@/lib/db/schema/posts"
import { validateAuth } from "@/lib/lucia"

export const hasAuth = m()
  .create(async ({ next, ...opts }) => {
    const session = await validateAuth()
    if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not signed in" })
    return next({ ...opts, ctx: { ...opts.ctx, session } })
  })

export const hasRole = (role: Role) => m<{ ctx: { session: Session } }>()
  .create(async ({ ctx, next }) => {
    if (_hasRole(ctx.session.user.role, role)) throw new TRPCError({ code: "FORBIDDEN", message: "Signed in user does not have the required role" })
    return next()
  })

export const canEditUser = m<{ ctx: { session: Session }, input: UserIdParams }>()
  .create(async ({ ctx, input: { id }, next }) => {
    if (_hasRole(ctx.session.user.role, "Site Moderator")) return next()
    if (id !== ctx.session.user.userId) throw new TRPCError({ code: "FORBIDDEN", message: "Signed in user does not own user with specified ID and does not have required access level to override operation" })
    return next()
  })

export const canEditPost = m<{ ctx: { session: Session }, input: PostIdParams }>()
  .create(async ({ ctx, next, ...opts }) => {
    const post = await findPostById({ id: opts.input.id })
    if (_hasRole(ctx.session.user.role, "Post Editor")) return next({ ...opts, ctx: { ...ctx, post } })
    if (post.createdBy !== ctx.session.user.userId) throw new TRPCError({ code: "FORBIDDEN", message: "Signed in user does not own post with specified ID and does not have required access level to override operation" })
    return next({ ...opts, ctx: { ...ctx, post } })
  })
