"use client"

import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Upload, MessageSquare, Network, FlipHorizontal, ClipboardCheck, Settings, Info } from "lucide-react"
import { Anton } from "next/font/google"

// Initialize Anton font
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

interface DocsSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  isOpen: boolean
  isMobile: boolean
}

export function DocsSidebar({ activeSection, setActiveSection, isOpen, isMobile }: DocsSidebarProps) {
  const sections = [
    { id: "getting-started", label: "Getting Started", icon: <BookOpen className="w-5 h-5" /> },
    { id: "file-management", label: "File Management", icon: <Upload className="w-5 h-5" /> },
    { id: "ai-chat", label: "AI Chat", icon: <MessageSquare className="w-5 h-5" /> },
    { id: "mind-maps", label: "Mind Maps", icon: <Network className="w-5 h-5" /> },
    { id: "flashcards", label: "Flashcards", icon: <FlipHorizontal className="w-5 h-5" /> },
    { id: "quizzes", label: "Quizzes", icon: <ClipboardCheck className="w-5 h-5" /> },
    { id: "account-settings", label: "Account Settings", icon: <Settings className="w-5 h-5" /> },
    { id: "faq", label: "FAQ", icon: <Info className="w-5 h-5" /> },
  ]

  const sidebarVariants = {
    open: {
      x: 0,
      width: isMobile ? "100%" : "280px",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: isMobile ? "-100%" : 0,
      width: isMobile ? "100%" : "0px",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  }

  return (
    <AnimatePresence>
      {(isOpen || !isMobile) && (
        <motion.div
          className={`bg-[#F2F5DA] ${isMobile ? "fixed inset-0 z-40" : "relative"}`}
          initial={isMobile ? "closed" : "open"}
          animate={isOpen ? "open" : "closed"}
          exit="closed"
          variants={sidebarVariants}
        >
          <div className="p-6 overflow-y-auto h-full pt-[180px] relative">
            <h2 className={`${anton.className} text-2xl text-[#86AB5D] mb-8 relative z-10`}>EXPLORE</h2>

            <nav className="space-y-3 relative z-10">
              {sections.map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                    activeSection === section.id
                      ? "bg-[#86AB5D] text-[#F2F5DA]"
                      : "hover:bg-[#86AB5D]/10 text-[#3A5A40]"
                  }`}
                  style={{ fontFamily: "'Quicksand', sans-serif" }}
                  whileHover={{ x: activeSection === section.id ? 0 : 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`${activeSection === section.id ? "text-[#F2F5DA]" : "text-[#E48D44]"}`}>
                    {section.icon}
                  </div>
                  <span className="font-bold">{section.label}</span>
                </motion.button>
              ))}
            </nav>

            {/* Decorative bottom shape */}
            <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-[#86AB5D] opacity-20 rounded-tr-full"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
