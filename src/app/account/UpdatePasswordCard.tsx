import { AccountCard, AccountCardFooter, AccountCardBody } from "@/app/account/AccountCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { trpc } from "@/lib/trpc/client"
import { passwordSchema } from "@/lib/db/schemas/users"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { z } from "zod"

export const UpdatePasswordCard = () => {
  const router = useRouter()
  const utils = trpc.useUtils()
  const schema = z.object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  const maxPasswordLength = passwordSchema.maxLength
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const { mutate, isLoading } = trpc.account.updatePassword.useMutation({
    onSuccess: _ => {
      utils.users.query.invalidate()
      router.refresh()
      toast.success("Updated password")
    },
  })

  return (
    <AccountCard header="Password" description="Please enter the password you want to use to sign in to your account.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(({ password, confirmPassword }) => {
          if (password !== confirmPassword) return form.setError("confirmPassword", { message: "Passwords do not match" })
          form.setValue("password", "")
          form.setValue("confirmPassword", "")
          mutate({ password })
        })}>
          <AccountCardBody>
            <FormField control={form.control} name="password" render={({ field: { value, ...props } }) => (
              <FormItem>
                <FormControl>
                  <Input {...props} placeholder="Password" type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}/>
          </AccountCardBody>
          <AccountCardBody>
            <FormField control={form.control} name="confirmPassword" render={({ field: { value, ...props } }) => (
              <FormItem>
                <FormControl>
                  <Input {...props} placeholder="Confirm Password" type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}/>
          </AccountCardBody>
          <AccountCardFooter description={maxPasswordLength !== null ? `${maxPasswordLength} characters maximum` : ""}>
            <Button disabled={isLoading}>Update Password</Button>
          </AccountCardFooter>
        </form>
      </Form>
    </AccountCard>
  )
}

export default UpdatePasswordCard
