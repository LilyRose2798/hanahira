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

export const UpdateNameCard = ({ name }: { name: string }) => {
  const router = useRouter()
  const utils = trpc.useUtils()
  const schema = updateUserSchema.pick({ name: true }).required()
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name },
  })

  const { mutate, isLoading } = trpc.account.update.useMutation({
    onSuccess: user => {
      utils.users.query.invalidate()
      router.refresh()
      toast.success(`Updated name to ${user.name}`)
    },
    onError: e => toast.error(e.message),
  })

  return (
    <AccountCard header="Your Name" description="Please enter your full name, or a display name you are comfortable with.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(x => mutate(x))}>
          <AccountCardBody>
            <FormField control={form.control} name="name" render={({ field: { value, ...props } }) => (
              <FormItem>
                <FormControl>
                  <Input {...props} value={nullToUndef(value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}/>
          </AccountCardBody>
          <AccountCardFooter description="64 characters maximum">
            <Button disabled={isLoading}>Update Name</Button>
          </AccountCardFooter>
        </form>
      </Form>
    </AccountCard>
  )
}

export default UpdateNameCard
