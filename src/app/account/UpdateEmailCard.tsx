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

export const UpdateEmailCard = ({ email, emailVerifiedAt }: { email: string, emailVerifiedAt: Date | null }) => {
  const router = useRouter()
  const utils = trpc.useUtils()
  const schema = updateUserSchema.pick({ email: true }).required()
  const maxEmailLength = schema.shape.email.unwrap().maxLength
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email },
  })

  const { mutateAsync: updateAcount, isLoading: isUpdatingAccount } = trpc.account.update.useMutation({
    onSuccess: user => {
      toast.success(user.email !== null ? `Updated email to ${user.email}` : "Removed email")
      utils.users.query.invalidate()
      router.refresh()
    },
    onError: e => toast.error(e.message),
  })
  const { mutateAsync: initiateEmailVerification, isLoading: isInitiatingEmailVerification } =
    trpc.auth.initiateEmailVerification.useMutation({
      onSuccess: emailVerification => toast.success(`Sent verification email to ${emailVerification.email}`),
      onError: e => toast.error(e.message),
    })

  return (
    <AccountCard header="Email Address" description="Please enter the email address you want to use with your account.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(x => updateAcount(x))}>
          <AccountCardBody>
            <FormField control={form.control} name="email" render={({ field: { value, ...props } }) => (
              <FormItem>
                <FormControl>
                  <Input {...props} type="email" value={nullToUndef(value)} placeholder="Email Address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}/>
          </AccountCardBody>
          <AccountCardFooter description={maxEmailLength !== null ? `${maxEmailLength} characters maximum` : ""}>
            <div>
              {emailVerifiedAt === null ? <Button type="button"
                onClick={form.handleSubmit(x => updateAcount(x).then(() => initiateEmailVerification()))}
                disabled={isUpdatingAccount || isInitiatingEmailVerification}>Verify Email</Button> :
                <span className="text-sm text-green-500 px-2">Email Verified</span>}
              <Button className="ml-4" disabled={isUpdatingAccount}>Update Email</Button>
              {email && <Button className="ml-4" type="button" onClick={() => {
                form.setValue("email", "")
                updateAcount({ email: null })
              }} variant="destructive" disabled={isUpdatingAccount}>Remove Email</Button>}
            </div>
          </AccountCardFooter>
        </form>
      </Form>
    </AccountCard>
  )
}

export default UpdateEmailCard
