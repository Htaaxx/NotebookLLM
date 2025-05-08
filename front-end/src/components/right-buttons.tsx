"use client"
import { FileText, Network, BookOpen, BrainCircuit, Clipboard } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { buttonAnimation } from "@/lib/motion-utils"

interface RightButtonsProps {
  onViewChange: (view: "preview" | "mindmap" | "cheatsheet" | null) => void
  activeView: "preview" | "mindmap" | "cheatsheet" | null
  isDisabled?: boolean
}

export function RightButtons({ onViewChange, activeView, isDisabled = false }: RightButtonsProps) {
  return (
    <motion.div
      className="flex flex-col gap-4 z-50"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Preview/PDF Review Button */}
      <motion.div
        whileHover={isDisabled ? undefined : "hover"}
        whileTap={isDisabled ? undefined : "tap"}
        variants={buttonAnimation}
      >
        <Button
          variant={activeView === "preview" ? "default" : "outline"}
          size="icon"
          onClick={() => !isDisabled && onViewChange(activeView === "preview" ? null : "preview")}
          className={`rounded-full w-12 h-12 flex items-center justify-center relative ${
            activeView === "preview"
              ? "bg-[#E48D44] hover:bg-[#d47d34]" 
              : "bg-[#F2F5DA] text-gray-700 border-[#86AB5D] hover:bg-[#E7E7C9]"
          } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isDisabled}
          title={isDisabled ? "Document processing in progress. Please wait." : "PDF Review"}
        >
          <FileText className={`w-5 h-5 z-20 ${activeView === "preview" ? "text-white" : "text-[#518650]"}`} />
        </Button>
      </motion.div>

      {/* Mind Map Button */}
      <motion.div
        whileHover={isDisabled ? undefined : "hover"}
        whileTap={isDisabled ? undefined : "tap"}
        variants={buttonAnimation}
      >
        <Button
          variant={activeView === "mindmap" ? "default" : "outline"}
          size="icon"
          onClick={() => !isDisabled && onViewChange(activeView === "mindmap" ? null : "mindmap")}
          className={`rounded-full flex items-center justify-center ${
            activeView === "mindmap"
              ? "bg-[#E48D44] hover:bg-[#d47d34]"
              : "bg-[#F2F5DA] text-[#518650] border-[#86AB5D] hover:bg-[#E7E7C9]"
          } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isDisabled}
          title={isDisabled ? "Document processing in progress. Please wait." : "Mind Map"}
        >
          <BrainCircuit className="w-5 h-5 z-10 relative" />
        </Button>
      </motion.div>

      {/* Cheatsheet Button */}
      <motion.div
        whileHover={isDisabled ? undefined : "hover"}
        whileTap={isDisabled ? undefined : "tap"}
        variants={buttonAnimation}
      >
        <Button
          variant={activeView === "cheatsheet" ? "default" : "outline"}
          size="icon"
          onClick={() => !isDisabled && onViewChange(activeView === "cheatsheet" ? null : "cheatsheet")}
          className={`rounded-full flex items-center justify-center ${
            activeView === "cheatsheet"
              ? "bg-[#E48D44] hover:bg-[#d47d34]"
              : "bg-[#F2F5DA] text-[#518650] border-[#86AB5D] hover:bg-[#E7E7C9]"
          } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isDisabled}
          title={isDisabled ? "Document processing in progress. Please wait." : "Cheatsheet"}
        >
          <Clipboard className="w-5 h-5 z-10 relative" />
        </Button>
      </motion.div>
    </motion.div>
  )
}
