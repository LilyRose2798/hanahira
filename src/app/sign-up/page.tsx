import AuthForm from "@/components/auth/AuthForm"
import Link from "next/link"
import { authErrorHandle } from "@/lib/trpc/utils"
import { api } from "@/lib/trpc/api"
import { redirect } from "next/navigation"
import { Metadata } from "next"

const title = "Sign Up"
export const metadata: Metadata = { title }
export const dynamic = "force-dynamic"

const SignUp = async () => {
  const user = await api.account.find.current.query().catch(authErrorHandle)
  if (user) redirect("/")
  return (
    <section className="container max-w-lg mx-auto">
      <h1 className="text-center text-2xl font-semibold my-6">{title}</h1>
      <AuthForm isSignUp />
      <div className="text-center text-sm mt-4 text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-secondary-foreground underline">Sign In</Link>
      </div>
    </section>
  )
}

export default SignUp
