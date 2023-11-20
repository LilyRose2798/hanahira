import { TRPCError, experimental_standaloneMiddleware as m } from "@trpc/server"
import { findPostById } from "@/lib/api/posts"
import { User, UserIdParams } from "@/lib/db/schemas/users"
import { PostIdParams } from "@/lib/db/schemas/posts"
import { UserRole, hasUserRole } from "@/lib/db/enums/userRole"
import { validateAuth } from "@/lib/lucia"

export const hasAuth = m()
  .create(async ({ type, next }) => {
    const { session, user } = await validateAuth(type === "mutation")
    if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not signed in" })
    return next({ ctx: { session, user } })
  })

export const hasRole = (userRole: UserRole) => m<{ ctx: { user: User } }>()
  .create(async ({ ctx: { user }, next }) => {
    if (hasUserRole(user.role, userRole)) throw new TRPCError({ code: "FORBIDDEN", message: "Signed in user does not have the required role" })
    return next()
  })

export const canEditUser = m<{ ctx: { user: User }, input: UserIdParams }>()
  .create(async ({ ctx: { user }, input: { id }, next }) => {
    if (hasUserRole(user.role, "SITE_MODERATOR")) return next()
    if (id !== user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Signed in user does not own user with specified ID and does not have required access level to override operation" })
    return next()
  })

export const canEditPost = m<{ ctx: { user: User }, input: PostIdParams }>()
  .create(async ({ ctx: { user }, input: { id }, next }) => {
    const post = await findPostById({ id })
    if (hasUserRole(user.role, "POST_EDITOR")) return next({ ctx: { post } })
    if (post.createdBy !== user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Signed in user does not own post with specified ID and does not have required access level to override operation" })
    return next({ ctx: { post } })
  })
