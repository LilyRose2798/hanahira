"use client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc/client"
import React from "react"

export const SignOutBtn = ({ plain = false }) => {
  const router = useRouter()

  const { mutate, isLoading } = trpc.signOut.useMutation({
    onSuccess: () => {
      toast.success("Signed out")
      router.push("/sign-in")
    },
  })

  const props = { onClick: () => mutate(), disabled: isLoading }
  const text = `Sign${isLoading ? "ing" : ""} out`
  return plain ?
    <button {...props} className="w-full text-left">{text}</button> :
    <Button {...props} variant="destructive">{text}</Button>
}

export default SignOutBtn
