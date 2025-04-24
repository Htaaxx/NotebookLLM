"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DocsSidebar } from "@/components/docs/docs-sidebar"
import { DocsContent } from "@/components/docs/docs-content"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import AuthUI from "@/components/auth-ui"

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started")
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Add event listener for setActiveSection
  useEffect(() => {
    const handleSetActiveSection = (event: CustomEvent) => {
      if (event.detail && event.detail.section) {
        setActiveSection(event.detail.section)

        // Scroll to top when changing sections
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
    }

    window.addEventListener("setActiveSection", handleSetActiveSection as EventListener)

    return () => {
      window.removeEventListener("setActiveSection", handleSetActiveSection as EventListener)
    }
  }, [])

  // Add state and handlers for auth modal
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    const handleOpenAuthModal = () => {
      setShowAuth(true)
    }

    window.addEventListener("openAuthModal", handleOpenAuthModal)

    return () => {
      window.removeEventListener("openAuthModal", handleOpenAuthModal)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Fixed Navbar - styled to match landing page */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <Logo className="h-8 w-8 text-green-600" />
                <span className="font-bold text-xl">NoteUS</span>
              </Link>
              <nav className="ml-10 flex items-center space-x-8">
                <Link href="/" className="text-gray-900 hover:text-green-600 px-3 py-2 font-medium">
                  HOME
                </Link>
                <Link href="#features" className="text-gray-900 hover:text-green-600 px-3 py-2 font-medium">
                  FEATURES
                </Link>
                <Link href="/pricing" className="text-gray-900 hover:text-green-600 px-3 py-2 font-medium">
                  PRICING
                </Link>
                <Link href="/docs" className="text-green-600 border-b-2 border-green-600 px-3 py-2 font-medium">
                  DOCS
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => setShowAuth(true)}
              >
                Sign In
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowAuth(true)}>
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      <motion.div
        className="min-h-screen flex flex-col bg-white pt-16" // Added pt-16 for padding-top
        initial="hidden"
        animate="show"
        variants={staggerContainer(0.1, 0.1)}
      >
        <motion.div className="bg-green-600 text-white py-16 px-6" variants={fadeIn("down", 0.2)}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">NoteUS Documentation</h1>
            <p className="text-xl text-green-100 max-w-3xl">
              Learn how to use NoteUS to transform your notes into knowledge and enhance your learning experience.
            </p>
          </div>
        </motion.div>

        <div className="flex flex-1 relative">
          {/* Mobile sidebar toggle */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="fixed bottom-6 right-6 z-50 bg-green-600 text-white p-3 rounded-full shadow-lg"
            >
              {sidebarOpen ? "✕" : "☰"}
            </button>
          )}

          {/* Sidebar */}
          <DocsSidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            isOpen={sidebarOpen}
            isMobile={isMobile}
          />

          {/* Main content */}
          <DocsContent activeSection={activeSection} sidebarOpen={sidebarOpen} />
        </div>
        {showAuth && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuth(false)} />
            <div className="z-10 w-full max-w-md">
              <AuthUI
                onAuthSuccess={() => {
                  setShowAuth(false)
                  window.location.href = "/defaultPage"
                }}
              />
              <button
                onClick={() => setShowAuth(false)}
                className="mt-4 text-white hover:underline text-sm mx-auto block"
              >
                Return to documentation
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
