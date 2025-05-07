"use client"

import { motion } from "framer-motion"
import { fadeIn } from "@/lib/motion-utils"
import { GettingStartedSection } from "./sections/getting-started-section"
import { FileManagementSection } from "./sections/file-management-section"
import { AIChatSection } from "./sections/ai-chat-section"
import { MindMapsSection } from "./sections/mind-maps-section"
import { FlashcardsSection } from "./sections/flashcards-section"
import { QuizzesSection } from "./sections/quizzes-section"
import { AccountSettingsSection } from "./sections/account-settings-section"
import { FAQSection } from "./sections/faq-section"

interface DocsContentProps {
  activeSection: string
  sidebarOpen: boolean
}

export function DocsContent({ activeSection, sidebarOpen }: DocsContentProps) {
  const renderSection = () => {
    switch (activeSection) {
      case "getting-started":
        return <GettingStartedSection />
      case "file-management":
        return <FileManagementSection />
      case "ai-chat":
        return <AIChatSection />
      case "mind-maps":
        return <MindMapsSection />
      case "flashcards":
        return <FlashcardsSection />
      case "quizzes":
        return <QuizzesSection />
      case "account-settings":
        return <AccountSettingsSection />
      case "faq":
        return <FAQSection />
      default:
        return <GettingStartedSection />
    }
  }

  return (
    <motion.div
      className={`flex-1 p-6 md:p-10 overflow-y-auto transition-all duration-300 bg-[#F2F5DA] ${
        sidebarOpen ? "md:ml-0" : "md:ml-0"
      }`}
      initial="hidden"
      animate="show"
      variants={fadeIn("up", 0.2)}
      key={activeSection} // This forces re-render when section changes
    >
      {/* Decorative elements */}
      <div className="absolute top-[10%] right-[5%] w-40 h-40 bg-[#86AB5D] rounded-full opacity-10"></div>
      <div className="absolute bottom-[10%] left-[5%] w-32 h-32 bg-[#E48D44] rounded-full opacity-10"></div>

      <div className="max-w-4xl mx-auto relative z-10">{renderSection()}</div>
    </motion.div>
  )
}
