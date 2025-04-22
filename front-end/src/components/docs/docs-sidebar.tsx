"use client"

import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Upload, MessageSquare, Network, FlipHorizontal, ClipboardCheck, Settings, Info } from "lucide-react"

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
          className={`bg-gray-50 border-r ${isMobile ? "fixed inset-0 z-40" : "relative"}`}
          initial={isMobile ? "closed" : "open"}
          animate={isOpen ? "open" : "closed"}
          exit="closed"
          variants={sidebarVariants}
        >
          <div className="p-6 overflow-y-auto h-full">
            <h2 className="text-xl font-bold mb-6 text-green-600">Documentation</h2>

            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activeSection === section.id ? "bg-green-100 text-green-700" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {section.icon}
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
