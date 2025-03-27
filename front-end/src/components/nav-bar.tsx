"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { UserCircle, ChevronDown } from "lucide-react"
import { Logo } from "./logo"
import { authAPI } from "../lib/api"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export function NavBar() {
  const [userName, setUserName] = useState("User")
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUserName(storedUsername)
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignOut = async () => {
    console.log("Sign out button clicked")
    try {
      await authAPI.signOut()
      console.log("Sign out successful")
      window.location.href = "/"
    } catch (error) {
      console.error("Sign out failed", error)
    }
  }

  // Determine if we're on a specific page to highlight the active nav item
  const isActivePage = (path: string) => {
    if (typeof window !== "undefined") {
      return window.location.pathname.includes(path)
    }
    return false
  }

  return (
    <nav
      className={`flex items-center h-16 px-6 border-b sticky top-0 z-50 bg-white transition-shadow ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <Logo className="w-8 h-8 text-green-600" />
        <span className="font-semibold">NoteUS</span>
      </div>

      <div className="flex gap-8 ml-12">
        <Link
          href="/defaultPage"
          className={`hover:text-green-600 transition-colors py-1 border-b-2 ${
            isActivePage("defaultPage") ? "border-green-600 text-green-600" : "border-transparent"
          }`}
        >
          CHATBOX
        </Link>
        <Link
          href="/files"
          className={`hover:text-green-600 transition-colors py-1 border-b-2 ${
            isActivePage("files") ? "border-green-600 text-green-600" : "border-transparent"
          }`}
        >
          FILES
        </Link>
        <Link
          href="/flashcard"
          className={`hover:text-green-600 transition-colors py-1 border-b-2 ${
            isActivePage("flashcard") ? "border-green-600 text-green-600" : "border-transparent"
          }`}
        >
          FLASHCARD
        </Link>
      </div>

      <div className="ml-auto relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors">
              <UserCircle className="w-6 h-6" />
              <span className="text-sm font-medium">{userName}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <div className="p-2 border-b text-sm font-medium">{userName}</div>
            <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleSignOut}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

