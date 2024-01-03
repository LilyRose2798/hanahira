"use client"
import UpdateNameCard from "@/app/account/UpdateNameCard"
import UpdateEmailCard from "@/app/account/UpdateEmailCard"
import UpdatePasswordCard from "@/app/account/UpdatePasswordCard"
import Update2FACard from "./Update2FACard"
import { User } from "@/lib/db/schemas/users"

export const UserSettings = ({ user }: { user: User | null }) => (<>
  <UpdateNameCard name={user?.name ?? ""} />
  <UpdateEmailCard email={user?.email ?? ""} emailVerifiedAt={user?.emailVerifiedAt ?? null} />
  <UpdatePasswordCard />
  <Update2FACard />
</>)

export default UserSettings
