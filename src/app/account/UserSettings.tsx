"use client"
import UpdateNameCard from "@/app/account/UpdateNameCard"
import UpdateEmailCard from "@/app/account/UpdateEmailCard"
import UpdatePasswordCard from "@/app/account/UpdatePasswordCard"
import Update2FACard from "@/app/account/Update2FACard"
import { User } from "@/lib/db/schemas/users"

export const UserSettings = ({ user: { name, username, email, emailVerifiedAt, otpSecret, otpEnabled } }:
  { user: User & { otpSecret: string, otpEnabled: boolean } }) => (<>
  <UpdateNameCard name={name ?? ""} />
  <UpdateEmailCard email={email ?? ""} emailVerifiedAt={emailVerifiedAt} />
  <UpdatePasswordCard />
  <Update2FACard otpSecret={otpSecret} otpEnabled={otpEnabled} username={username} />
</>)

export default UserSettings
