import UserSettings from "@/app/account/UserSettings"
import { validateAuth } from "@/lib/lucia"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = { title: "Account" }

const Account = async () => {
  const session = await validateAuth()
  if (!session) redirect("/sign-in")
  return (
    <section className="container">
      <h1 className="text-3xl font-semibold my-6">Account</h1>
      <div className="space-y-6">
        <UserSettings session={session} />
      </div>
    </section>
  )
}

export default Account
