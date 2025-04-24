"use client"

import Link from "next/link"
import { useState } from "react"

interface NavBarProps {
  onNavClick: () => void
  onSignUp: () => void
  onSignIn: () => void
}

export function NavBar({ onNavClick, onSignUp, onSignIn }: NavBarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
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
        >
          DOCS
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onSignIn}
          className="bg-[#86AB5D] text-[#F2F5DA] w-[150px] h-[50px] rounded-[53px] text-[16px] font-bold"
          style={{ fontFamily: "'Quicksand', sans-serif" }}
        >
          SIGN IN
        </button>
        <button
          onClick={onSignUp}
          className="bg-[#E48D44] text-[#F2F5DA] w-[150px] h-[50px] rounded-[53px] text-[16px] font-bold"
          style={{ fontFamily: "'Quicksand', sans-serif" }}
        >
          SIGN UP
        </button>
      </div>
    </div>
  )
}
