"use client"
import UpdateNameCard from "@/app/account/UpdateNameCard"
import UpdateEmailCard from "@/app/account/UpdateEmailCard"
import { User } from "lucia"

export const UserSettings = ({ user }: { user: User | null }) => (<>
  <UpdateNameCard name={user?.name ?? ""} />
  <UpdateEmailCard email={user?.email ?? ""} />
</>)

export default UserSettings
