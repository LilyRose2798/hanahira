import type { Metadata } from "next"
import { ReactNode } from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import ThemeProvider from "@/components/ThemeProvider"
import Toaster from "@/components/Toaster"
import Navbar from "@/components/Navbar"
import TrpcProvider from "@/lib/trpc/Provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Hanahira - Powered by Petals",
    template: "%s | Hanahira",
  },
  description: "Powered by Petals",
  applicationName: "Hanahira",
  keywords: ["Booru", "Imageboard"],
}

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body className={inter.className}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TrpcProvider>
          <main className="max-w-5xl mx-auto px-3">
            <Navbar />
            {children}
          </main>
        </TrpcProvider>
        <Toaster />
      </ThemeProvider>
    </body>
  </html>
)

export default RootLayout
