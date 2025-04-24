"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, LogOut } from "lucide-react"
import { Logo } from "@/components/logo"
import { authAPI } from "@/lib/api"
import { useLanguage } from "@/lib/language-context"
import type { Language } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = localStorage.getItem("username")
      const token = localStorage.getItem("accessToken")

      if (storedUsername) {
        setUserName(storedUsername)
      }

      // Check if user is logged in
      setIsLoggedIn(!!token)

      const handleScroll = () => {
        setIsScrolled(window.scrollY > 10)
      }

      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }
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

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
  }

  const isActivePage = (path: string) => {
    return pathname?.includes(path) || false
  }

  return (
    <div className="sticky top-0 z-50 w-full bg-[#86AB5D] shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo on the left */}
        <Link href={isLoggedIn ? "/defaultPage" : "/"} className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-[#F2F5DA] " />
          <span className="font-anton font-normal text-[#F2F5DA] text-2xl">NoteUS</span>
        </Link>

        {/* Navigation links in the center */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-8">
          <Link
            href="/defaultPage"
            className={`font-quicksand font-bold text-[#F2F5DA] hover:text-[#F26D3D] transition-colors py-1 px-4 ${
              isActivePage("defaultPage") ? "text-[#F26D3D]" : ""
            }`}
          >
            {t("CHATBOX").toUpperCase()}
          </Link>
          <Link
            href="/files"
            className={`font-quicksand font-bold text-[#F2F5DA] hover:text-[#F26D3D] transition-colors py-1 px-4 ${
              isActivePage("files") ? "text-[#F26D3D]" : ""
            }`}
          >
            {t("FILES").toUpperCase()}
          </Link>
          <Link
            href="/flashcard"
            className={`font-quicksand font-bold text-[#F2F5DA] hover:text-[#F26D3D] transition-colors py-1 px-4 ${
              isActivePage("flashcard") ? "text-[#F26D3D]" : ""
            }`}
            suppressHydrationWarning
          >
            {t("FLASHCARD").toUpperCase()}
          </Link>
        </div>

        {/* User profile on the right */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="navProfile" size="navProfile" className="flex items-center gap-2">
              <span className="font-quicksand font-bold text-[#86AB5D]">{userName}</span>
              <div className="w-6 h-6 rounded-full bg-[#D9A066]"></div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white" align="end">
            <DropdownMenuItem
              className="cursor-pointer font-quicksand"
              onClick={() => changeLanguage(language === "en" ? "vi" : "en")}
            >
              {t("language")}: {language.toUpperCase()}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center cursor-pointer font-quicksand">
                <User className="w-4 h-4 mr-2" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center font-quicksand"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
