import UserSettings from "@/app/account/UserSettings"
import { base32Encode, generateOTPKey } from "@/lib/api/otp"
import { api } from "@/lib/trpc/api"
import { authErrorRedirect } from "@/lib/trpc/utils"
import { Metadata } from "next"

const title = "Account"
export const metadata: Metadata = { title }
export const dynamic = "force-dynamic"

const Account = async () => {
  const user = await api.account.find.current.query().catch(authErrorRedirect)
  const otpSecret = user.otpSecret ?? base32Encode(await generateOTPKey())

  return (
    <section className="container">
      <h1 className="text-2xl font-semibold my-6">{title}</h1>
      <div className="my-6 space-y-6">
        <UserSettings user={{ ...user, otpSecret, otpEnabled: !!user.otpSecret }} />
      </div>
    </section>
  )
}

export default Account
