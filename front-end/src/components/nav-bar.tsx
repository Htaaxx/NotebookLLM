import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { UserCircle } from "lucide-react"
import { Logo } from "./logo"
import { authAPI } from "../lib/api"
import { Button } from "@/components/ui/button"

export function NavBar() {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSignOut = async () => {
    try {
      await authAPI.signOut()
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed", error)
    }
  }

  return (
    <nav className="flex items-center h-16 px-6 border-b">
      <div className="flex items-center gap-2">
        <Logo className="w-8 h-8" />
        <span className="font-semibold">NoteGPT</span>
      </div>
      <div className="flex gap-8 ml-32">
        <Link href="/defaulPage" className="hover:text-primary">
          Chatbox
        </Link>
        <Link href="/files" className="hover:text-primary">
          Files
        </Link>
        <Link href="/flashcard" className="hover:text-primary">
          Flashcard
        </Link>
      </div>
      <div className="ml-auto relative">
        <button className="p-1 rounded-full hover:bg-gray-100" onClick={() => setShowDropdown(!showDropdown)}>
          <UserCircle className="w-6 h-6" />
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
            <div className="p-2 border-b text-gray-700">Htax</div>
            <Button variant="outline" size="sm" className="w-full text-left" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}

