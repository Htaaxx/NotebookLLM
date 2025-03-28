"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"

interface NavBarProps {
  onNavClick: () => void
  onSignUp: () => void
  onSignIn: () => void
}

export function NavBar({ onNavClick, onSignUp, onSignIn }: NavBarProps) {
  return (
    <nav className="flex items-center justify-between p-4 max-w-7xl mx-auto bg-white text-black">
      <Link href="/" className="flex items-center gap-2">
        <Logo className="h-8 w-8 text-green-600" />
        <span className="font-bold text-xl">NoteUS</span>
      </Link>

      <div className="hidden md:flex items-center space-x-6">
        <button onClick={onNavClick} className="font-medium hover:text-green-600 transition-colors">
          CHATBOX
        </button>
        <button onClick={onNavClick} className="font-medium hover:text-green-600 transition-colors">
          FILES
        </button>
        <button onClick={onNavClick} className="font-medium hover:text-green-600 transition-colors">
          MINDMAP
        </button>
        <button onClick={onNavClick} className="font-medium hover:text-green-600 transition-colors">
          FLASHCARD
        </button>
        <Link href="/pricing" className="font-medium hover:text-green-600 transition-colors">
          PRICING
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onSignUp} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
          Sign Up
        </Button>
        <Button onClick={onSignIn} className="bg-green-600 hover:bg-green-700 text-white">
          Sign In
        </Button>
      </div>
    </nav>
  )
}

