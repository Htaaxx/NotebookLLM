"use client"

import Link from "next/link"
import { useState } from "react"
import AuthUI from "@/components/auth-ui"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface NavBarProps {
  onNavClick?: () => void // Make this prop optional
  onSignUp?: () => void // Add optional prop for sign up
  onSignIn?: () => void // Add optional prop for sign in
}

export default function NavBar({ onNavClick, onSignUp, onSignIn }: NavBarProps = {}) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn()
    } else {
      setAuthMode("signin")
      setShowAuthModal(true)
    }
  }

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp()
    } else {
      setAuthMode("signup")
      setShowAuthModal(true)
    }
  }

  const handleNavClick = () => {
    if (onNavClick) {
      onNavClick()
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // You can add additional logic here, like redirecting to a dashboard
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-[50px] h-[50px] bg-[#E48D44] mr-3"></div>
          <span className="text-[35px] text-[#86AB5D] font-normal" style={{ fontFamily: "'Anton', sans-serif" }}>
            NoteUs
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center space-x-8">
          <Link
            href="/"
            className={`font-bold text-[18px] py-1 px-4 rounded-full transition-colors ${
              hoveredItem === "home" ? "bg-[#E48D44] text-[#F2F5DA]" : "text-[#86AB5D]"
            }`}
            style={{ fontFamily: "'Quicksand', sans-serif" }}
            onMouseEnter={() => setHoveredItem("home")}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={handleNavClick}
          >
            HOME
          </Link>
          <Link
            href="/features"
            className={`font-bold text-[18px] py-1 px-4 rounded-full transition-colors ${
              hoveredItem === "features" ? "bg-[#E48D44] text-[#F2F5DA]" : "text-[#86AB5D]"
            }`}
            style={{ fontFamily: "'Quicksand', sans-serif" }}
            onMouseEnter={() => setHoveredItem("features")}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={handleNavClick}
          >
            FEATURES
          </Link>
          <Link
            href="/pricing"
            className={`font-bold text-[18px] py-1 px-4 rounded-full transition-colors ${
              hoveredItem === "pricing" ? "bg-[#E48D44] text-[#F2F5DA]" : "text-[#86AB5D]"
            }`}
            style={{ fontFamily: "'Quicksand', sans-serif" }}
            onMouseEnter={() => setHoveredItem("pricing")}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={handleNavClick}
          >
            PRICING
          </Link>
          <Link
            href="/docs"
            className={`font-bold text-[18px] py-1 px-4 rounded-full transition-colors ${
              hoveredItem === "docs" ? "bg-[#E48D44] text-[#F2F5DA]" : "text-[#86AB5D]"
            }`}
            style={{ fontFamily: "'Quicksand', sans-serif" }}
            onMouseEnter={() => setHoveredItem("docs")}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={handleNavClick}
          >
            DOCS
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSignIn}
            className="bg-[#86AB5D] text-[#F2F5DA] w-[150px] h-[50px] rounded-[53px] text-[16px] font-bold"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            SIGN IN
          </button>
          <button
            onClick={handleSignUp}
            className="bg-[#E48D44] text-[#F2F5DA] w-[150px] h-[50px] rounded-[53px] text-[16px] font-bold"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            SIGN UP
          </button>
        </div>
      </div>

      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="p-0 border-none bg-transparent max-w-md">
          <AuthUI initialMode={authMode} onAuthSuccess={handleAuthSuccess} />
        </DialogContent>
      </Dialog>
    </>
  )
}
