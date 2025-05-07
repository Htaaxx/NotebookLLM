"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DocsSidebar } from "@/components/docs/docs-sidebar"
import { DocsContent } from "@/components/docs/docs-content"
import Link from "next/link"
import { Menu, X, ChevronDown } from "lucide-react"
import { Anton } from "next/font/google"
import AuthUI from "@/components/auth-ui"

// Initialize Anton font
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started")
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showAuth, setShowAuth] = useState(false)

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F5DA] overflow-hidden">
      {/* Navbar */}
      <div className="relative w-full px-4 md:px-[90px] pt-[20px] md:pt-[40px] mb-6">
        <div className="w-full md:w-[90%] mx-auto">
          <div className="relative w-full">
            {/* Green outer oval */}
            <div className="absolute inset-0 bg-[#86AB5D] rounded-[80px]"></div>

            {/* Cream inner oval */}
            <div className="absolute top-[10px] left-[10px] right-[10px] bottom-[10px] bg-[#F2F5DA] rounded-[70px]"></div>

            {/* Content */}
            <div className="relative z-10 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link href="/" className="flex items-center">
                    <div className="w-[50px] h-[50px] bg-[#E48D44] mr-3"></div>
                    <span className={`${anton.className} text-[35px] text-[#86AB5D] font-normal`}>NoteUs</span>
                  </Link>
                </div>

                <div className="flex-1 flex items-center justify-center space-x-8">
                  <Link
                    href="/"
                    className="font-bold text-[18px] py-1 px-4 rounded-full transition-colors text-[#86AB5D] hover:bg-[#E48D44] hover:text-[#F2F5DA]"
                    style={{ fontFamily: "'Quicksand', sans-serif" }}
                  >
                    HOME
                  </Link>
                  <Link
                    href="/features"
                    className="font-bold text-[18px] py-1 px-4 rounded-full transition-colors text-[#86AB5D] hover:bg-[#E48D44] hover:text-[#F2F5DA]"
                    style={{ fontFamily: "'Quicksand', sans-serif" }}
                  >
                    FEATURES
                  </Link>
                  <Link
                    href="/pricing"
                    className="font-bold text-[18px] py-1 px-4 rounded-full transition-colors text-[#86AB5D] hover:bg-[#E48D44] hover:text-[#F2F5DA]"
                    style={{ fontFamily: "'Quicksand', sans-serif" }}
                  >
                    PRICING
                  </Link>
                  <Link
                    href="/docs"
                    className="font-bold text-[18px] py-1 px-4 rounded-full transition-colors bg-[#E48D44] text-[#F2F5DA]"
                    style={{ fontFamily: "'Quicksand', sans-serif" }}
                  >
                    DOCS
                  </Link>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowAuth(true)}
                    className="bg-[#86AB5D] text-[#F2F5DA] w-[150px] h-[50px] rounded-[53px] text-[16px] font-bold"
                    style={{ fontFamily: "'Quicksand', sans-serif" }}
                  >
                    SIGN IN
                  </button>
                  <button
                    onClick={() => setShowAuth(true)}
                    className="bg-[#E48D44] text-[#F2F5DA] w-[150px] h-[50px] rounded-[53px] text-[16px] font-bold"
                    style={{ fontFamily: "'Quicksand', sans-serif" }}
                  >
                    SIGN UP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with Decorative Elements */}
      <div className="relative mb-8">
        {/* Main green block with decorative circles */}
        <div className="relative bg-[#86AB5D] py-16 px-6 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-[15%] right-[3%] w-64 h-64 bg-[#518650] rounded-full opacity-50"></div>
          <div className="absolute bottom-[30%] right-[41%] w-32 h-32 bg-[#E48D44] rounded-full z-20 opacity-70"></div>
          <div className="absolute bottom-[-5%] right-[20%] w-48 h-48 bg-[#3A5A40] rounded-full opacity-40"></div>

          {/* Content */}
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className={`${anton.className} text-5xl md:text-7xl font-bold mb-4 text-white`}>DOCUMENTATION</h1>
              <p className="text-xl text-[#F2F5DA] max-w-3xl" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                Learn how to use NoteUS to transform your notes into knowledge and enhance your learning experience.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 relative mt-20" id="docs-content">
        {/* Mobile sidebar toggle */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="fixed bottom-6 right-6 z-50 bg-[#E48D44] text-white p-3 rounded-full shadow-lg"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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

      {/* Auth Modal Overlay */}
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
    </div>
  )
}
