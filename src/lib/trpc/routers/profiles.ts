import { router as r, procedure as p } from "@/lib/trpc"
import { hasAuth } from "@/lib/trpc/middleware"
import { usernameSchema, queryUsernameSchema, publicUserSchema, publicQueryUserSchema, queryCreatedByUsernameSchema } from "@/lib/db/schemas/users"
import { partialPostSchema } from "@/lib/db/schemas/posts"
import { queryUsers, queryUserByUsername, findUserByUsername, findUsers } from "@/lib/api/users"
import { findPostsCreatedByUsername, queryPostsCreatedByUsername } from "@/lib/api/posts"
import { tags as postTags } from "@/lib/trpc/routers/posts"
import { partialUploadSchema } from "@/lib/db/schemas/uploads"
import { findUploadsCreatedByUsername, queryUploadsCreatedByUsername } from "@/lib/api/uploads"

export const tags = ["Profiles"]

export const profilesRouter = r({
  find: r({
    many: p.use(hasAuth).query(async () => findUsers({})),
    byUsername: p.use(hasAuth).input(usernameSchema).query(async ({ input }) => findUserByUsername(input)),
    uploads: p.use(hasAuth).input(usernameSchema).query(async ({ input }) => findUploadsCreatedByUsername(input)),
    posts: p.use(hasAuth).input(usernameSchema).query(async ({ input }) => findPostsCreatedByUsername(input)),
  }),
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
      .query(async ({ input }) => queryUsers(input)),
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
      .input(queryUsernameSchema)
      .output(publicUserSchema)
      .query(async ({ input }) => queryUserByUsername(input)),
    uploads: p
      .meta({ openapi: {
        method: "GET",
        path: "/profiles/{username}/uploads",
        tags,
        summary: "Query a profile's uploads",
        description: "Query the data of the uploads created by the profile with the specified username",
        protect: true,
        successDescription: "Upload data successfully returned",
        errorResponses: {
          400: "Invalid user ID",
          401: "Not signed in",
          500: "Unexpected server error",
        },
      } })
      .use(hasAuth)
      .input(queryCreatedByUsernameSchema)
      .output(partialUploadSchema.array())
      .query(async ({ input }) => queryUploadsCreatedByUsername(input)),
    posts: p
      .meta({ openapi: {
        method: "GET",
        path: "/profiles/{username}/posts",
        tags: [...tags, ...postTags],
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
      .input(queryCreatedByUsernameSchema)
      .output(partialPostSchema.array())
      .query(async ({ input }) => queryPostsCreatedByUsername(input)),
  }),
})
