import AuthForm from "@/components/auth/AuthForm"
import Link from "next/link"
import { authErrorHandle } from "@/lib/trpc/utils"
import { api } from "@/lib/trpc/api"
import { redirect } from "next/navigation"
import { Metadata } from "next"

const title = "Sign In"
export const metadata: Metadata = { title }
export const dynamic = "force-dynamic"

const SignIn = async () => {
  const user = await api.account.find.current.query().catch(authErrorHandle)
  if (user) redirect("/")
  return (
    <section className="container max-w-lg mx-auto">
      <h1 className="text-center text-2xl font-semibold my-6">{title}</h1>
      <AuthForm />
      <div className="text-center text-sm mt-4 text-muted-foreground">
        Don&apos;t have an account yet?{" "}
        <Link href="/sign-up" className="text-secondary-foreground underline">Sign Up</Link>
      </div>
    </section>
  )
}

export default SignIn
