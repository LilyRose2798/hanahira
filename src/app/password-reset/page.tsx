import { Metadata } from "next"

const title = "Password Reset"
export const metadata: Metadata = { title }

const PasswordReset = async () => (
  <section className="container mt-6">
    <h1 className="font-semibold text-2xl my-2">{title}</h1>
  </section>
)

export default PasswordReset
