"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

interface NavBarProps {
  onNavClick: () => void
  onSignUp: () => void
  onSignIn: () => void
}

export function NavBar({ onNavClick, onSignUp, onSignIn }: NavBarProps) {
  const pathname = usePathname()

  // Determine which nav item should be highlighted
  const isHomePage = pathname === "/"
  const isPricingPage = pathname === "/pricing"
  const isDocsPage = pathname === "/docs"

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-green-600" />
              <span className="font-bold text-xl">NoteUS</span>
            </Link>
            <nav className="ml-10 flex items-center space-x-8">
              <Link
                href="/"
                className={`font-medium hover:text-green-600 transition-colors py-1 border-b-2 ${
                  isHomePage ? "border-green-600 text-green-600" : "border-transparent text-gray-900"
                }`}
              >
                HOME
              </Link>
              <Link
                href="/pricing"
                className={`font-medium hover:text-green-600 transition-colors py-1 border-b-2 ${
                  isPricingPage ? "border-green-600 text-green-600" : "border-transparent text-gray-900"
                }`}
              >
                PRICING
              </Link>
              <Link
                href="/docs"
                className={`font-medium hover:text-green-600 transition-colors py-1 border-b-2 ${
                  isDocsPage ? "border-green-600 text-green-600" : "border-transparent text-gray-900"
                }`}
              >
                DOCS
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={onSignIn} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              Sign In
            </Button>
            <Button onClick={onSignUp} className="bg-green-600 hover:bg-green-700 text-white">
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
