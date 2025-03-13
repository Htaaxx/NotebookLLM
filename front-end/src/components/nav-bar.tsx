import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { UserCircle } from "lucide-react"
import { Logo } from "./logo"
import { authAPI } from "../lib/api"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

export function NavBar() {
  const handleSignOut = async () => {
    console.log("Sign out button clicked");
    try {
      await authAPI.signOut()
      console.log("Sign out successful");
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed", error)
    }
  }

  const userName = "Htax"; // Replace with dynamic user name retrieval logic

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-full hover:bg-gray-100">
              <UserCircle className="w-6 h-6" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
            <div className="p-2 border-b text-gray-700 font-semibold">{userName}</div>
            <DropdownMenuItem asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-left cursor-pointer hover:bg-gray-200"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

