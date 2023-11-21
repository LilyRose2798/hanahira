import SignOutBtn from "@/components/auth/SignOutBtn"
import { validateAuth } from "@/lib/lucia"
import { redirect } from "next/navigation"

const Profile = async () => {
  const { session, user } = await validateAuth()
  if (!session) redirect("/sign-up")
  return (
    <section className="container">
      <h1 className="text-2xl font-bold my-6">Profile</h1>
      <pre className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg my-2">
        {JSON.stringify(session, null, 2)}
      </pre>
      <pre className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg my-2">
        {JSON.stringify(user, null, 2)}
      </pre>
      <SignOutBtn />
    </section>
  )
}

export default Profile
