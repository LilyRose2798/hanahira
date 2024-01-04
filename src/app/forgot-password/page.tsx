import { Metadata } from "next"

const title = "Forgot Password"
export const metadata: Metadata = { title }

const ForgotPassword = async () => (
  <section className="container mt-6">
    <h1 className="font-semibold text-2xl my-2">{title}</h1>
  </section>
)

export default ForgotPassword
