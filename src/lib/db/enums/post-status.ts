export const postStatuses = ["ACTIVE", "DELETED"] as const

export type PostStatus = typeof postStatuses[number]

export const postStatusNames = {
  ACTIVE: "Active",
  DELETED: "Deleted",
} satisfies { [K in PostStatus]: string }

export const postStatusName = (postStatus: PostStatus): string => postStatusNames[postStatus]
