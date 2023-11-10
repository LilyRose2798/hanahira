"use client"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc/client"
import React from "react"

export const SignOutBtn = ({ plain = false }) => {
  const { toast, onError } = useToast()
  const router = useRouter()

  const { mutate, isLoading } = trpc.signOut.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Signed out" })
      router.push("/sign-in")
      router.refresh()
    },
    onError: err => {
      onError(err)
      if (err.data?.httpStatus === 401) {
        router.push("/sign-in")
        router.refresh()
      }
    },
  })

  const props = { onClick: () => mutate(), disabled: isLoading }
  const text = `Sign${isLoading ? "ing" : ""} out`
  return plain ?
    <button {...props} className="w-full text-left">{text}</button> :
    <Button {...props} variant="destructive">{text}</Button>
}

export default SignOutBtn
