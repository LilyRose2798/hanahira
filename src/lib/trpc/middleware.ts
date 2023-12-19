import { TRPCError, experimental_standaloneMiddleware as m } from "@trpc/server"
import { findPostById } from "@/lib/api/posts"
import { User, UserIdParams } from "@/lib/db/schemas/users"
import { PostIdParams } from "@/lib/db/schemas/posts"
import { UserRole, hasUserRole } from "@/lib/db/enums/user-role"
import { validateAuth, WithSessionParams } from "@/lib/api/auth"

export const hasAuthWith = <T extends WithSessionParams["with"]>(_with: T) => m()
  .create(async ({ type, next }) => {
    const session = await validateAuth({ verifyOrigin: type === "mutation", with: _with })
    if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not signed in" })
    return next({ ctx: { session } })
  })

export const hasAuth = hasAuthWith(undefined)
export const hasAuthWithUser = hasAuthWith({ creator: true })

export const hasRole = (userRole: UserRole) => m<{ ctx: { session: { creator: User } } }>()
  .create(async ({ ctx: { session: { creator: { role } } }, next }) => {
    if (hasUserRole(role, userRole)) throw new TRPCError({ code: "FORBIDDEN", message: "Signed in user does not have the required role" })
    return next()
  })

export const canEditUser = m<{ ctx: { session: { creator: User } }, input: UserIdParams }>()
  .create(async ({ ctx: { session: { creator: user } }, input: { id }, next }) => {
    if (hasUserRole(user.role, "SITE_MODERATOR")) return next()
    if (id !== user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Signed in user does not own user with specified ID and does not have required access level to override operation" })
    return next()
  })

export const canEditPost = m<{ ctx: { session: { creator: User } }, input: PostIdParams }>()
  .create(async ({ ctx: { session: { creator: user } }, input: { id }, next }) => {
    const post = await findPostById({ id })
    if (hasUserRole(user.role, "POST_EDITOR")) return next({ ctx: { post } })
    if (post.createdBy !== user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Signed in user does not own post with specified ID and does not have required access level to override operation" })
    return next({ ctx: { post } })
  })
