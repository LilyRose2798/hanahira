import AuthForm from "@/components/auth/AuthForm"
import { validateAuth } from "@/lib/lucia"
import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

export const metadata: Metadata = { title: "Sign In" }

const SignIn = async () => {
  const { session } = await validateAuth()
  if (session) redirect("/")
  return (
    <section className="container max-w-lg mx-auto my-4 bg-secondary p-10">
      <h1 className="text-2xl font-semibold text-center">Sign in to your account</h1>
      <AuthForm />
      <div className="mt-4 text-sm text-center text-muted-foreground">
        Don&apos;t have an account yet?{" "}
        <Link href="/sign-up" className="text-accent-foreground underline hover:text-primary">Create an account</Link>
      </div>
    </section>
  )
}

export default SignIn
