"use client"
import { FileText, Network, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { buttonAnimation } from "@/lib/motion-utils"

interface RightButtonsProps {
  onViewChange: (view: "preview" | "mindmap" | "cheatsheet" | null) => void
  activeView: "preview" | "mindmap" | "cheatsheet" | null
}

export function RightButtons({ onViewChange, activeView }: RightButtonsProps) {
  return (
    <motion.div
      className="flex flex-col gap-2 z-50"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <motion.div whileHover="hover" whileTap="tap" variants={buttonAnimation}>
        <Button
          variant={activeView === "preview" ? "default" : "outline"}
          size="icon"
          onClick={() => onViewChange(activeView === "preview" ? null : "preview")}
          className={`rounded-full w-10 h-10 ${activeView === "preview" ? "bg-green-600 hover:bg-green-700" : "hover:text-green-600 hover:border-green-600"}`}
        >
          <FileText className="w-4 h-4" />
        </Button>
      </motion.div>
      <motion.div whileHover="hover" whileTap="tap" variants={buttonAnimation}>
        <Button
          variant={activeView === "mindmap" ? "default" : "outline"}
          size="icon"
          onClick={() => onViewChange(activeView === "mindmap" ? null : "mindmap")}
          className={`rounded-full w-10 h-10 ${activeView === "mindmap" ? "bg-green-600 hover:bg-green-700" : "hover:text-green-600 hover:border-green-600"}`}
        >
          <Network className="w-4 h-4" />
        </Button>
      </motion.div>
      <motion.div whileHover="hover" whileTap="tap" variants={buttonAnimation}>
        <Button
          variant={activeView === "cheatsheet" ? "default" : "outline"}
          size="icon"
          onClick={() => onViewChange(activeView === "cheatsheet" ? null : "cheatsheet")}
          className={`rounded-full w-10 h-10 ${activeView === "cheatsheet" ? "bg-green-600 hover:bg-green-700" : "hover:text-green-600 hover:border-green-600"}`}
        >
          <BookOpen className="w-4 h-4" />
        </Button>
      </motion.div>
    </motion.div>
  )
}
