/* eslint-disable @next/next/no-img-element */
import { AccountCard, AccountCardFooter, AccountCardBody } from "@/app/account/AccountCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { trpc } from "@/lib/trpc/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { z } from "zod"
import { nullToUndef } from "@/lib/utils"
import { base32Encode, generateOTPKey, generateOTPURL, verifyTOTP } from "@/lib/api/otp"
import { toDataURL } from "qrcode"
import { useEffect, useState } from "react"

export const Update2FACard = ({ otpSecret }: { otpSecret?: string | null }) => {
  const router = useRouter()
  const utils = trpc.useUtils()
  const schema = z.object({
    totp: z.string().min(6).max(6),
  })
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { totp: "" },
  })

  const [key, setKey] = useState<string>()
  const [otpURL, setOTPURL] = useState<string>()
  const [otpDataURL, setOTPDataURL] = useState<string>()
  useEffect(() => {
    (async () => {
      if (!otpSecret) {
        const k = base32Encode(await generateOTPKey())
        setKey(k)
        const url = generateOTPURL(k)
        setOTPURL(url)
        const dataURL = await toDataURL(url)
        setOTPDataURL(dataURL)
      }
    })()
  }, [otpSecret])

  const { mutate: enable2FA, isLoading: isEnabling2FA } = trpc.account.enable2FA.useMutation({
    onSuccess: () => {
      setKey(undefined)
      setOTPURL(undefined)
      setOTPDataURL(undefined)
      utils.users.query.invalidate()
      router.refresh()
      toast.success("Successfully enabled 2FA on your account")
    },
  })

  const { mutate: disable2FA, isLoading: isDisabling2FA } = trpc.account.disable2FA.useMutation({
    onSuccess: () => {
      utils.users.query.invalidate()
      router.refresh()
      toast.success("Successfully disabled 2FA on your account")
    },
  })

  return (
    <AccountCard header="Two-Factor Authentication" description="Manage the two-factor authentication settings for your account.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(async ({ totp }) => {
          form.setValue("totp", "")
          if (otpSecret) {
            if (!(await verifyTOTP(totp, otpSecret, { window: 3 }))) return toast.error("Incorrect TOTP code")
            disable2FA({ totp })
          } else if (!key) toast.error("Missing OTP key. Please try again.")
          else {
            if (!(await verifyTOTP(totp, key, { window: 3 }))) return toast.error("Incorrect TOTP code")
            enable2FA({ otpSecret: key, totp })
          }
        })}>
          <AccountCardBody>
            {(otpURL && otpDataURL) && <img title={otpURL} alt="The QR code to set up 2FA" src={otpDataURL} />}
            {otpURL && <p className="my-4" >{otpURL}</p>}
            <FormField control={form.control} name="totp" render={({ field: { value, ...props } }) => (
              <FormItem>
                <FormControl>
                  <Input {...props} value={nullToUndef(value)} placeholder="Two-Factor Verification Code" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}/>
          </AccountCardBody>
          <AccountCardFooter description="">
            {otpSecret ? <Button variant="destructive" disabled={isDisabling2FA}>Disable 2FA</Button> :
              <Button disabled={isEnabling2FA}>Enable 2FA</Button>}
          </AccountCardFooter>
        </form>
      </Form>
    </AccountCard>
  )
}

export default Update2FACard
