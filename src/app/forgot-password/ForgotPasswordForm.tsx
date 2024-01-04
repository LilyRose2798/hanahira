"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { trpc } from "@/lib/trpc/client"
import { signInSchema } from "@/lib/db/schemas/users"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { z } from "zod"

export const PasswordResetForm = () => {
  const router = useRouter()
  const utils = trpc.useUtils()
  const schema = signInSchema.pick({ username: true })
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
    },
  })

  const { mutate, isLoading } = trpc.auth.initiatePasswordReset.useMutation({
    onSuccess: () => {
      toast.success("Password reset email sent")
      utils.users.query.invalidate()
      router.refresh()
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(x => mutate(x))} className={"space-y-8"}>
        <FormField control={form.control} name="username" render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        <Button className="w-full" disabled={isLoading}>Forgot Password</Button>
      </form>
    </Form>
  )
}

export default PasswordResetForm
