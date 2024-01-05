/* eslint-disable @next/next/no-img-element */
import { generateOTPURL } from "@/lib/api/otp"
import { toDataURL } from "qrcode"
import { useEffect, useState } from "react"

export const Setup2FAInfo = ({ otpSecret, username }: { otpSecret: string, username: string }) => {
  const otpURL = generateOTPURL(otpSecret, { label: "Hanahira", user: `${username}@hanahira.moe`, issuer: "Hanahira" })
  const [otpDataURL, setOTPDataURL] = useState<string>()
  useEffect(() => {
    toDataURL(otpURL).then(setOTPDataURL)
    console.log("rendering 2fa setup info")
  }, [otpURL])

  return <div>
    {otpDataURL ? <img title={otpURL} alt="The QR code to set up 2FA" src={otpDataURL} /> : <p>Loading QR Code...</p>}
    <p className="my-4" >{otpSecret}</p>
    <p className="my-4" >{otpURL}</p>
  </div>
}

export default Setup2FAInfo
