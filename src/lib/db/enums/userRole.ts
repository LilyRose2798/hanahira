// roles in order of precedence (each role has all roles prior to it)
export const userRoles = [
  "USER",
  "TAG_EDITOR",
  "POST_EDITOR",
  "CONTENT_MODERATOR",
  "SITE_MODERATOR",
  "ADMIN",
] as const

export type UserRole = typeof userRoles[number]
export const defaultUserRole = "USER" satisfies UserRole

export const userRoleNames = {
  USER: "User",
  TAG_EDITOR: "Tag Editor",
  POST_EDITOR: "Post Editor",
  CONTENT_MODERATOR: "Content Moderator",
  SITE_MODERATOR: "Site Moderator",
  ADMIN: "Admin",
} satisfies { [K in UserRole]: string }

export const hasUserRole = (currentUserRole: UserRole, requiredUserRole: UserRole): boolean => (
  currentUserRole === requiredUserRole || userRoles.indexOf(requiredUserRole) <= userRoles.indexOf(currentUserRole))

export const userRoleName = (userRole: UserRole): string => userRoleNames[userRole]
