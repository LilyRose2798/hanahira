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
  const maxNameLength = schema.shape.name.unwrap().maxLength
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name },
  })
  const currentName = form.getValues("name")
  const nameChanged = currentName !== name

  const { mutate, isLoading } = trpc.account.update.useMutation({
    onSuccess: user => {
      utils.users.query.invalidate()
      router.refresh()
      toast.success(user.name !== null ? `Updated name to ${user.name}` : "Removed name")
    },
    onError: e => toast.error(e.message),
  })

  return (
    <AccountCard header="Display Name" description="Please enter your full name, or a display name you are comfortable with.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(x => mutate(x))}>
          <AccountCardBody>
            <FormField control={form.control} name="name" render={({ field: { value, ...props } }) => (
              <FormItem>
                <FormControl>
                  <Input {...props} value={nullToUndef(value)} placeholder="Display Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}/>
          </AccountCardBody>
          <AccountCardFooter description={maxNameLength !== null ? `${maxNameLength} characters maximum` : ""}>
            <div>
              <Button disabled={!nameChanged || isLoading}>Update Name</Button>
              {name && <Button className="ml-4" type="button" onClick={() => {
                form.setValue("name", "")
                mutate({ name: null })
              }} variant="destructive" disabled={isLoading}>Remove Name</Button>}
            </div>
          </AccountCardFooter>
        </form>
      </Form>
    </AccountCard>
  )
}

export default UpdateNameCard
