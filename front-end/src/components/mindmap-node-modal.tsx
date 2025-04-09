"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

interface MindMapNodeModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
}

export function MindMapNodeModal({ isOpen, onClose, title, content }: MindMapNodeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Close modal when clicking outside
  useEffect(() => {
    console.log("Modal state changed:", isOpen)

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        console.log("Click outside modal detected")
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Close modal when pressing Escape
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen, onClose])

  // Parse the content to render it properly
  const renderContent = () => {
    if (!content) return null

    // Split content into lines
    const lines = content.split("\n").filter((line) => line.trim() !== "")

    return (
      <div className="space-y-4">
        {lines.map((line, index) => {
          // Check if line is a bullet point
          if (line.trim().startsWith("-")) {
            const bulletContent = line.trim().substring(1).trim()
            return (
              <div key={index} className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-green-600"></span>
                <p className="text-gray-700">{bulletContent}</p>
              </div>
            )
          }

          // Check if line is a sub-heading (starts with multiple #)
          if (line.trim().startsWith("##")) {
            const level = line.trim().split(" ")[0].length
            const headingContent = line.trim().substring(level).trim()

            if (level === 2) {
              return (
                <h2 key={index} className="text-xl font-semibold mt-6 mb-2">
                  {headingContent}
                </h2>
              )
            } else if (level === 3) {
              return (
                <h3 key={index} className="text-lg font-medium mt-4 mb-2">
                  {headingContent}
                </h3>
              )
            } else {
              return (
                <h4 key={index} className="text-base font-medium mt-3 mb-1">
                  {headingContent}
                </h4>
              )
            }
          }

          // Regular paragraph
          return (
            <p key={index} className="text-gray-700">
              {line}
            </p>
          )
        })}
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            className="z-10 w-full max-w-2xl max-h-[80vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-green-600 text-white py-4 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-xl">{title}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-green-700"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 max-h-[calc(80vh-80px)] overflow-y-auto">{renderContent()}</CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
