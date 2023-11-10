// eslint-disable-next-line spaced-comment
/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("@/lib/lucia").Auth
  type DatabaseUserAttributes = {
    username: string
    name: string | null
    email: string | null
    access_level: number
  }
  type DatabaseSessionAttributes = {}
}
