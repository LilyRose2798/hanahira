import AuthForm from "@/components/auth/AuthForm"
import { authErrorHandle } from "@/lib/trpc/utils"
import { Metadata } from "next"
import Link from "next/link"
import { api } from "@/lib/trpc/api"
import { redirect } from "next/navigation"

const title = "Sign In"
export const metadata: Metadata = { title }
export const dynamic = "force-dynamic"

const SignIn = async () => {
  const user = await api.account.find.current.query().catch(authErrorHandle)
  if (user) redirect("/")
  return (
    <section className="container max-w-lg mx-auto my-4 bg-secondary p-10">
      <h1 className="text-2xl font-semibold text-center">{title}</h1>
      <AuthForm />
      <div className="mt-4 text-sm text-center text-muted-foreground">
        Don&apos;t have an account yet?{" "}
        <Link href="/sign-up" className="text-accent-foreground underline hover:text-primary">Sign Up</Link>
      </div>
    </section>
  )
}

export default SignIn
