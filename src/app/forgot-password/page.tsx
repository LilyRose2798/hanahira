import { Metadata } from "next"
import ForgotPasswordForm from "@/app/forgot-password/ForgotPasswordForm"

const title = "Forgot Password"
export const metadata: Metadata = { title }

const ForgotPassword = async () => (
  <section className="container max-w-lg mx-auto">
    <h1 className="text-center text-2xl font-semibold my-6">{title}</h1>
    <ForgotPasswordForm />
  </section>
)

export default ForgotPassword
