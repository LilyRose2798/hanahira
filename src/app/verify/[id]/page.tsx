import { Metadata } from "next"
import { api } from "@/lib/trpc/api"
import { isTRPCClientError } from "@/lib/trpc/utils"

export const metadata: Metadata = { title: "Email Verification" }

const EmailVerification = async ({ params: { id } }: { params: { id: string } }) => {
  const message = await api.auth.submitEmailVerification.mutate({ id })
    .then(() => "Email successfully verified")
    .catch(e => (isTRPCClientError(e) ? e.message : "Error verifying email"))
  return (
    <section className="container">
      <h1 className="font-semibold text-2xl my-6">{message}</h1>
    </section>
  )
}

export default EmailVerification
