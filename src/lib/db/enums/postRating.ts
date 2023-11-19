export const postRatings = ["SAFE", "SENSITIVE", "QUESTIONABLE", "EXPLICIT"] as const

export type PostRating = typeof postRatings[number]

export const postRatingNames = {
  SAFE: "Safe",
  SENSITIVE: "Sensitive",
  QUESTIONABLE: "Questionable",
  EXPLICIT: "Explicit",
} satisfies { [K in PostRating]: string }

export const postRatingName = (postRating: PostRating): string => postRatingNames[postRating]
