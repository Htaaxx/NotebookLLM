"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"

interface NavBarProps {
  onNavClick: () => void
  onSignUp: () => void
  onSignIn: () => void
}

export function NavBar({ onNavClick, onSignUp, onSignIn }: NavBarProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Determine which nav item should be highlighted
  const isHomePage = pathname === "/"
  const isPricingPage = pathname === "/pricing"

  return (
    <nav className="flex items-center justify-between p-4 max-w-7xl mx-auto bg-white text-black h-16 border-b sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <Logo className="h-8 w-8 text-green-600" />
        <span className="font-bold text-xl">NoteUS</span>
      </Link>

      <div className="hidden md:flex items-center space-x-6">
        <button
          onClick={() => router.push("/")}
          className={`font-medium hover:text-green-600 transition-colors py-1 border-b-2 ${
            isHomePage ? "border-green-600 text-green-600" : "border-transparent"
          }`}
        >
          HOME
        </button>
        <button
          onClick={onNavClick}
          className="font-medium hover:text-green-600 transition-colors py-1 border-b-2 border-transparent"
        >
          FEATURES
        </button>
        <Link
          href="/pricing"
          className={`font-medium hover:text-green-600 transition-colors py-1 border-b-2 ${
            isPricingPage ? "border-green-600 text-green-600" : "border-transparent"
          }`}
        >
          PRICING
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onSignIn} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
          Sign In
        </Button>
        <Button onClick={onSignUp} className="bg-green-600 hover:bg-green-700 text-white">
          Sign Up
        </Button>
      </div>
    </nav>
  )
}

