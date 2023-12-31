import SignOutBtn from "@/components/auth/SignOutBtn"
import { api } from "@/lib/trpc/api"
import { authErrorRedirect } from "@/lib/trpc/utils"
import { Metadata } from "next"

const title = "Profile"
export const metadata: Metadata = { title }
export const dynamic = "force-dynamic"

const Profile = async () => {
  const user = await api.account.find.currentWithSession.query().catch(authErrorRedirect)
  return (
    <section className="container">
      <h1 className="text-2xl font-semibold my-6">{title}</h1>
      <pre className="bg-primary-foreground p-6 rounded-lg my-2">
        {JSON.stringify(user.session, null, 2)}
      </pre>
      <pre className="bg-primary-foreground p-6 rounded-lg my-2">
        {JSON.stringify(user, null, 2)}
      </pre>
      <SignOutBtn />
    </section>
  )
}

export default Profile
