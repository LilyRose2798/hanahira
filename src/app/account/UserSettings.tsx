"use client"
import UpdateNameCard from "@/app/account/UpdateNameCard"
import UpdateEmailCard from "@/app/account/UpdateEmailCard"
import { Session } from "lucia"

export const UserSettings = ({ session }: { session: Session | null }) => (<>
  <UpdateNameCard name={session?.user.name ?? ""} />
  <UpdateEmailCard email={session?.user.email ?? ""} />
</>)

export default UserSettings
