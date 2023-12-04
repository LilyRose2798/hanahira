"use client"
import { useEffect } from "react"
import { toast } from "sonner"

const Error = ({ error, reset }: { error: Error & { digest?: string }, reset: () => void}) => {
  useEffect(() => {
    toast.error(error.message)
  }, [error])
  return (
    <div className="py-4">
      <h2 className="py-4 text-2xl font-bold">Something went wrong!</h2>
      <p className="text-xl">{error.message}</p>
    </div>
  )
}

export default Error
