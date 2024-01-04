import { Metadata } from "next"
import PasswordResetForm from "@/app/password-reset/[id]/PasswordResetForm"
import { api } from "@/lib/trpc/api"

const title = "Reset Password"
export const metadata: Metadata = { title }

const ResetPassword = async ({ params: { id } }: { params: { id: string } }) => {
  const passwordReset = await api.auth.findPasswordResetById.query({ id }).catch(undefined)
  return (
    <section className="container max-w-lg mx-auto">
      <h1 className="text-center text-2xl font-semibold my-6">{title}</h1>
      {passwordReset === undefined ? <h2>Invalid password reset link</h2> :
        <PasswordResetForm resetPasswordId={id} />}
    </section>
  )
}

export default ResetPassword
