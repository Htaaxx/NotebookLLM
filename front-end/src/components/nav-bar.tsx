"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { UserCircle, ChevronDown, User, LogOut } from "lucide-react"
import { Logo } from "./logo"
import { authAPI } from "../lib/api"
import { useLanguage } from "@/lib/language-context"
import type { Language } from "@/lib/i18n"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/motion-utils"

export function NavBar() {
  const [userName, setUserName] = useState("User")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
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

  // Determine if we're on a specific page to highlight the active nav item
  const isActivePage = (path: string) => {
    if (typeof window !== "undefined") {
      return window.location.pathname.includes(path)
    }
    return false
  }

  return (
    <motion.nav
      className={`flex items-center h-16 px-6 border-b sticky top-0 z-50 bg-white text-black transition-shadow ${
        isScrolled ? "shadow-md" : ""
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo links to defaultPage if logged in, otherwise to landing page */}
      <Link href={isLoggedIn ? "/defaultPage" : "/"} className="flex items-center gap-2">
        <motion.div
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <Logo className="w-8 h-8 text-green-600" />
        </motion.div>
        <motion.span
          className="font-semibold"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          NoteUS
        </motion.span>
      </Link>

      <motion.div className="flex gap-8 ml-12" variants={fadeIn("down", 0.2)} initial="hidden" animate="show">
        <Link
          href="/defaultPage"
          className={`hover:text-green-600 transition-colors py-1 border-b-2 text-black ${
            isActivePage("defaultPage") ? "border-green-600 text-green-600" : "border-transparent"
          }`}
        >
          {t("chatbox")}
        </Link>
        <Link
          href="/files"
          className={`hover:text-green-600 transition-colors py-1 border-b-2 text-black ${
            isActivePage("files") ? "border-green-600 text-green-600" : "border-transparent"
          }`}
        >
          {t("files")}
        </Link>
        <Link
          href="/flashcard"
          className={`hover:text-green-600 transition-colors py-1 border-b-2 text-black ${
            isActivePage("flashcard") ? "border-green-600 text-green-600" : "border-transparent"
          }`}
        >
          {t("flashcard")}
        </Link>
      </motion.div>

      <motion.div className="ml-auto" variants={fadeIn("down", 0.3)} initial="hidden" animate="show">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors text-black"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserCircle className="w-6 h-6" />
              <span className="text-sm font-medium">{userName}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white text-black" align="end">
            <DropdownMenuItem
              className="cursor-pointer text-black"
              onClick={() => changeLanguage(language === "en" ? "vi" : "en")}
            >
              {t("language")}: {language.toUpperCase()}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    </motion.nav>
  )
}

