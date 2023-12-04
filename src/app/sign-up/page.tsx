import AuthForm from "@/components/auth/AuthForm"
import Link from "next/link"
import { authErrorHandle } from "@/lib/trpc/utils"
import { api } from "@/lib/trpc/api"
import { redirect } from "next/navigation"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Sign Up" }
export const dynamic = "force-dynamic"

const SignUp = async () => {
  const user = await api.account.find.current.query().catch(authErrorHandle)
  if (user) redirect("/")
  return (
    <section className="container max-w-lg mx-auto my-4 bg-secondary p-10">
      <h1 className="text-2xl font-semibold text-center">Create an account</h1>
      <AuthForm isSignUp />
      <div className="mt-4 text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-secondary-foreground underline">Sign in</Link>
      </div>
    </section>
  )
}

export default SignUp
