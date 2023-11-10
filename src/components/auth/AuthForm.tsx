"use client"
import { useRouter } from "next/navigation"
import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { signInSchema } from "@/lib/db/schema/users"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { trpc } from "@/lib/trpc/client"
import { z } from "zod"

export const AuthForm = ({ isSignUp = false }: {
  children?: ReactNode
  isSignUp?: boolean
}) => {
  const { toast, onError } = useToast()
  const router = useRouter()
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSuccess = () => {
    toast({ title: "Success", description: `Signed ${isSignUp ? "up" : "in"}` })
    router.refresh()
  }

  const { mutate: signIn, isLoading: isSigningIn } = trpc.signIn.useMutation({ onSuccess, onError })
  const { mutate: signUp, isLoading: isSigningUp } = trpc.signUp.useMutation({ onSuccess, onError })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(x => (isSignUp ? signUp(x) : signIn(x)))} className={"space-y-8"}>
        <FormField control={form.control} name="username" render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? undefined} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input {...field} type="password" value={field.value ?? undefined} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        <Button type="submit" className="w-full" disabled={isSigningIn || isSigningUp}>
          Sign{isSigningIn || isSigningUp ? "ing" : ""} {isSignUp ? "up" : "in"}
        </Button>
      </form>
    </Form>
  )
}

export default AuthForm
