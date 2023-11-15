/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("@/lib/lucia").Auth
  type DatabaseUserAttributes = Omit<import("@/lib/db/schemas/users").User, "id" | "createdAt" | "modifiedAt">
  type DatabaseSessionAttributes = {}
}
