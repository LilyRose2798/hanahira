import { AccountCard, AccountCardFooter, AccountCardBody } from "@/app/account/AccountCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { trpc } from "@/lib/trpc/client"
import { updateUserSchema } from "@/lib/db/schemas/users"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { z } from "zod"
import { nullToUndef } from "@/lib/utils"

export const Update2FACard = () => {
  const router = useRouter()
  const utils = trpc.useUtils()
  const schema = updateUserSchema.pick({ otpSecret: true }).required()
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { otpSecret: "" },
  })

  const { mutate, isLoading } = trpc.account.update.useMutation({
    onSuccess: () => {
      utils.users.query.invalidate()
      router.refresh()
      toast.success("Successfully enabled 2FA on your account")
    },
    onError: e => toast.error(e.message),
  })

  return (
    <AccountCard header="Two-Factor Authentication" description="">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(x => mutate(x))}>
          <AccountCardBody>
            <FormField control={form.control} name="otpSecret" render={({ field: { value, ...props } }) => (
              <FormItem>
                <FormControl>
                  <Input {...props} value={nullToUndef(value)} placeholder="Your 2FA Secret" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}/>
          </AccountCardBody>
          <AccountCardFooter description="64 characters maximum">
            <Button disabled={isLoading}>Update 2FA Secret</Button>
          </AccountCardFooter>
        </form>
      </Form>
    </AccountCard>
  )
}

export default Update2FACard
