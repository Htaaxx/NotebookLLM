"use client"

import { Logo } from "@/components/logo"

interface FooterProps {
  onNavClick: () => void
}

export function Footer({ onNavClick }: FooterProps) {
  return (
    <footer className="py-12 px-6 bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logo className="h-8 w-8 text-green-500" />
              <span className="font-bold text-xl text-white">NoteUS</span>
            </div>
            <p className="text-sm">Your AI-powered note-taking assistant that helps you study smarter, not harder.</p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Features</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" onClick={onNavClick} className="hover:text-white transition-colors">
                  AI Chat
                </a>
              </li>
              <li>
                <a href="#" onClick={onNavClick} className="hover:text-white transition-colors">
                  File Management
                </a>
              </li>
              <li>
                <a href="#" onClick={onNavClick} className="hover:text-white transition-colors">
                  Mind Mapping
                </a>
              </li>
              <li>
                <a href="#" onClick={onNavClick} className="hover:text-white transition-colors">
                  Flashcards
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" onClick={onNavClick} className="hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" onClick={onNavClick} className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" onClick={onNavClick} className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" onClick={onNavClick} className="hover:text-white transition-colors">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" onClick={onNavClick} className="hover:text-white transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" onClick={onNavClick} className="hover:text-white transition-colors">
                  Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} NoteUS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

