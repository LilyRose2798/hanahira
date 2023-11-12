// eslint-disable-next-line spaced-comment
/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("@/lib/lucia").Auth
  type DatabaseUserAttributes = Omit<import("@/lib/db/schema/users").User, "id">
  type DatabaseSessionAttributes = {}
}
