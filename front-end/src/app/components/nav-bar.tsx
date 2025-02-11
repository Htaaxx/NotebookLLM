import Image from "next/image"
import Link from "next/link"
import { UserCircle } from "lucide-react"

export function NavBar() {
  return (
    <nav className="flex items-center h-16 px-6 border-b">
      <div className="flex items-center gap-2">
        <Image src="/placeholder.svg" alt="Logo" width={32} height={32} className="w-8 h-8" />
        <span className="font-semibold">YourLogo</span>
      </div>
      <div className="flex gap-8 ml-32">
        <Link href="/chatbox" className="hover:text-primary">
          Chatbox
        </Link>
        <Link href="/files" className="hover:text-primary">
          Files
        </Link>
        <Link href="/flashcard" className="hover:text-primary">
          Flashcard
        </Link>
      </div>
      <div className="ml-auto">
        <button className="p-1 rounded-full hover:bg-gray-100">
          <UserCircle className="w-6 h-6" />
        </button>
      </div>
    </nav>
  )
}

