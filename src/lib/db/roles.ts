// roles in order of precedence (each role has all roles prior to it)
export const roles = [
  "USER",
  "TAG_EDITOR",
  "POST_EDITOR",
  "CONTENT_MODERATOR",
  "SITE_MODERATOR",
  "ADMIN",
] as const

export type Role = typeof roles[number]
export const defaultRole = "USER" satisfies Role

export const roleNames = {
  USER: "User",
  TAG_EDITOR: "Tag Editor",
  POST_EDITOR: "Post Editor",
  CONTENT_MODERATOR: "Content Moderator",
  SITE_MODERATOR: "Site Moderator",
  ADMIN: "Admin",
} satisfies { [K in Role]: string }

export const hasRole = (currentRole: Role, requiredRole: Role): boolean => (
  currentRole === requiredRole || roles.indexOf(requiredRole) <= roles.indexOf(currentRole))

export const roleName = (role: Role): string => roleNames[role]
