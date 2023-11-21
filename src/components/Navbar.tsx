import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import SignOutBtn from "@/components/auth/SignOutBtn"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { validateAuth } from "@/lib/lucia"
import Image from "next/image"

export const Navbar = async () => {
  const { user } = await validateAuth()
  return (
    <nav className="py-2 flex items-center justify-between transition-all duration-300">
      <h1 className="font-semibold hover:opacity-75 transition-hover cursor-pointer">
        <Link href="/"><Image src="/logo.svg" width={40} height={40} alt="The Hanahira Logo" /></Link>
      </h1>
      <div className="space-x-2 flex items-center">
        <ThemeToggle />
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarFallback>
                  {(user.name ?? user.username).split(" ").map(word => word[0].toUpperCase()).join("")}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuLabel>
                <span className="font-semibold">{(user.name ?? user.username)}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
              </Link>
              <Link href="/account">
                <DropdownMenuItem className="cursor-pointer">Account</DropdownMenuItem>
              </Link>
              <DropdownMenuItem>
                <SignOutBtn plain />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : <Link href="/sign-in">Sign in</Link>}
      </div>
    </nav>
  )
}

export default Navbar
