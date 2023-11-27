"use client"
import { useTheme } from "next-themes"
import { Toaster as SonnerToaster } from "sonner"

const Toaster = () => {
  const { theme } = useTheme()
  return <SonnerToaster richColors expand theme={theme === "light" ? "light" : theme === "dark" ? "dark" : "system"} />
}

export default Toaster
