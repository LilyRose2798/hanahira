import { router as r, procedure as p } from "@/lib/trpc"
import { hasAuth } from "@/lib/trpc/middleware"
import { usernameSchema, publicUserSchema, publicQueryUserSchema } from "@/lib/db/schemas/users"
import { postSchema } from "@/lib/db/schemas/posts"
import { findUsers, findUserByUsername } from "@/lib/api/users"
import { findPostsCreatedByUsername } from "@/lib/api/posts"

const tags = ["Profiles"]

export const profilesRouter = r({
  query: r({
    many: p
      .meta({ openapi: {
        method: "GET",
        path: "/profiles",
        tags,
        summary: "Query profile data",
        description: "Query the data of users",
        protect: true,
        successDescription: "Profile data successfully returned",
        errorResponses: {
          401: "Not signed in",
          500: "Unexpected server error",
        },
      } })
      .use(hasAuth)
      .input(publicQueryUserSchema)
      .output(publicUserSchema.array())
      .query(async ({ input: user }) => findUsers(user)),
    byUsername: p
      .meta({ openapi: {
        method: "GET",
        path: "/profiles/{username}",
        tags,
        summary: "Query a user's public data",
        description: "Query the data of the user with the specified username",
        protect: true,
        successDescription: "Profile data successfully returned",
        errorResponses: {
          400: "Invalid username",
          401: "Not signed in",
          404: "User not found with specified username",
          500: "Unexpected server error",
        },
      } })
      .use(hasAuth)
      .input(usernameSchema)
      .output(publicUserSchema)
      .query(async ({ input: { username } }) => findUserByUsername({ username })),
    posts: p
      .meta({ openapi: {
        method: "GET",
        path: "/profiles/{username}/posts",
        tags: [...tags, "Posts"],
        summary: "Query a profile's posts",
        description: "Query the data of the posts created by the profile with the specified username",
        protect: true,
        successDescription: "Post data successfully returned",
        errorResponses: {
          400: "Invalid username",
          401: "Not signed in",
          500: "Unexpected server error",
        },
      } })
      .use(hasAuth)
      .input(usernameSchema)
      .output(postSchema.array())
      .query(async ({ input: { username } }) => findPostsCreatedByUsername({ username })),
  }),
})
