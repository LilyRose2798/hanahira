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

export const UpdateEmailCard = ({ email }: { email: string }) => {
  const router = useRouter()
  const utils = trpc.useUtils()
  const schema = updateUserSchema.pick({ email: true }).required()
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email },
  })

  const { mutate, isLoading } = trpc.account.update.useMutation({
    onSuccess: user => {
      toast.success(`Updated email to ${user.email}`)
      utils.users.query.invalidate()
      router.refresh()
    },
    onError: e => toast.error(e.message),
  })

  return (
    <AccountCard header="Your Email" description="Please enter the email address you want to use with your account.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(x => mutate(x))}>
          <AccountCardBody>
            <FormField control={form.control} name="email" render={({ field: { value, ...props } }) => (
              <FormItem>
                <FormControl>
                  <Input {...props} type="email" value={nullToUndef(value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}/>
          </AccountCardBody>
          <AccountCardFooter description="512 characters maximum">
            <Button disabled={isLoading}>Update Email</Button>
          </AccountCardFooter>
        </form>
      </Form>
    </AccountCard>
  )
}

export default UpdateEmailCard
