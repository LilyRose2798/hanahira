export const roles = ["USER", "TAG_EDITOR", "POST_EDITOR", "CONTENT_MODERATOR", "SITE_MODERATOR", "ADMIN"] as const
export type Role = typeof roles[number]
export const defaultRole = "USER" satisfies Role
export const hasRole = (currentRole: Role, requiredRole: Role): boolean => (
  currentRole === requiredRole || roles.indexOf(requiredRole) <= roles.indexOf(currentRole))
