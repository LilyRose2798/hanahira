"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { trpc } from "@/lib/trpc/client"
import { passwordSchema } from "@/lib/db/schemas/users"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { z } from "zod"

export const PasswordResetForm = ({ resetPasswordId }: { resetPasswordId: string }) => {
  const router = useRouter()
  const utils = trpc.useUtils()
  const schema = z.object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const { mutate, isLoading } = trpc.auth.submitPasswordReset.useMutation({
    onSuccess: () => {
      toast.success("Password successfully reset")
      utils.users.query.invalidate()
      router.push("/sign-in")
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(({ password, confirmPassword }) => {
        if (password !== confirmPassword) return form.setError("confirmPassword", { message: "Passwords do not match" })
        form.setValue("password", "")
        form.setValue("confirmPassword", "")
        mutate({ id: resetPasswordId, password })
      })} className={"space-y-8"}>
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Password" type="password" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm password</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Confirm Password" type="password" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        <Button className="w-full" disabled={isLoading}>Reset Password</Button>
      </form>
    </Form>
  )
}

export default PasswordResetForm
