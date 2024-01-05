"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { signInSchema } from "@/lib/db/schemas/users"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { trpc } from "@/lib/trpc/client"
import { z } from "zod"
import Link from "next/link"

export const AuthForm = ({ isSignUp = false }: { isSignUp?: boolean }) => {
  const router = useRouter()
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSuccess = () => {
    toast.success(`Signed ${isSignUp ? "up" : "in"}`)
    router.refresh()
  }

  const { mutate: signIn, isLoading: isSigningIn } = trpc.auth.signIn.useMutation({ onSuccess })
  const { mutate: signUp, isLoading: isSigningUp } = trpc.auth.signUp.useMutation({ onSuccess })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(x => (isSignUp ? signUp(x) : signIn({ ...x, totp: x.totp ?? undefined })))} className={"space-y-8"}>
        <FormField control={form.control} name="username" render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input {...field} type="password" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        {!isSignUp && <>
          <Link href="/forgot-password" className="text-sm text-sky-500">Forgot Password?</Link>
          <FormField control={form.control} name="totp" render={({ field }) => (
            <FormItem>
              <FormLabel>Two-Factor Verification Code (if enabled)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
        </>}
        <Button type="submit" className="w-full" disabled={isSigningIn || isSigningUp}>
          Sign{isSigningIn || isSigningUp ? "ing" : ""} {isSignUp ? "up" : "in"}
        </Button>
      </form>
    </Form>
  )
}

export default AuthForm
