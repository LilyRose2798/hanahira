import AuthForm from "@/components/auth/AuthForm"
import Link from "next/link"
import { validateAuth } from "@/lib/lucia"
import { redirect } from "next/navigation"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Sign Up" }

const SignUp = async () => {
  const session = await validateAuth()
  if (session) redirect("/")
  return (
    <section className="container max-w-lg mx-auto my-4 bg-secondary p-10">
      <h1 className="text-2xl font-bold text-center">Create an account</h1>
      <AuthForm isSignUp />
      <div className="mt-4 text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-secondary-foreground underline">Sign in</Link>
      </div>
    </section>
  )
}

export default SignUp
