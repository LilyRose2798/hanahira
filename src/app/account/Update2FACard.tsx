import { AccountCard, AccountCardFooter, AccountCardBody } from "@/app/account/AccountCard"
import Setup2FAInfo from "@/app/account/Setup2FAInfo"
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
import { verifyTOTP } from "@/lib/api/otp"
import { totpSchema } from "@/lib/db/schemas/users"

export const Update2FACard = ({ otpSecret, otpEnabled, username }: { otpSecret: string, otpEnabled: boolean, username: string }) => {
  const router = useRouter()
  const utils = trpc.useUtils()
  const schema = z.object({
    totp: totpSchema,
  })
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { totp: "" },
  })

  const onSuccess = () => {
    utils.users.query.invalidate()
    toast.success(`Successfully ${otpEnabled ? "dis" : "on"}abled 2FA on your account`)
    router.refresh()
  }

  const { mutate: enable2FA, isLoading: isEnabling2FA } = trpc.account.enable2FA.useMutation({ onSuccess })
  const { mutate: disable2FA, isLoading: isDisabling2FA } = trpc.account.disable2FA.useMutation({ onSuccess })

  return (
    <AccountCard header="Two-Factor Authentication" description="Manage the two-factor authentication settings for your account.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(async ({ totp }) => {
          form.setValue("totp", "")
          if (!(await verifyTOTP(totp, otpSecret, { window: 3 }))) return toast.error("Incorrect TOTP code")
          if (otpEnabled) disable2FA({ totp })
          else enable2FA({ otpSecret, totp })
        })}>
          <AccountCardBody>
            {!otpEnabled && <Setup2FAInfo otpSecret={otpSecret} username={username} />}
            <FormField control={form.control} name="totp" render={({ field: { value, ...props } }) => (
              <FormItem>
                <FormControl>
                  <Input {...props} value={nullToUndef(value)} placeholder="Two-Factor Verification Code" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}/>
          </AccountCardBody>
          <AccountCardFooter description="6 digit numerical code required">
            {otpEnabled ? <Button variant="destructive" disabled={isDisabling2FA}>Disable 2FA</Button> :
              <Button disabled={isEnabling2FA}>Enable 2FA</Button>}
          </AccountCardFooter>
        </form>
      </Form>
    </AccountCard>
  )
}

export default Update2FACard
