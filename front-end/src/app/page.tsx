"use client"

import { useState, useCallback } from "react"
import { NavBar } from "@/app/components/nav-bar"
import { FileCollection } from "@/app/components/file-collection"
import { ChatBox } from "@/app/components/chat-box"
import { RightPanel } from "@/app/components/right-panel"
import { RightButtons } from "@/app/components/right-buttons"

interface FileItem {
  id: string
  name: string
  type: string
  url: string
  size: number
  selected: boolean
}

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([])
  const [activePanel, setActivePanel] = useState<"preview" | "mindmap" | null>(null)

  const handleFileSelection = useCallback((file: FileItem) => {
    setSelectedFiles((prev) => {
      const isAlreadySelected = prev.some((f) => f.id === file.id)
      if (isAlreadySelected) {
        return prev.filter((f) => f.id !== file.id)
      } else {
        return [...prev, file]
      }
    })
  }, [])

  const handleViewChange = useCallback((view: "preview" | "mindmap" | null) => {
    setActivePanel((prev) => (prev === view ? null : view))
  }, [])

  return (
    <main className="h-screen flex flex-col">
      <NavBar />
      <div className="flex flex-1 relative">
        <FileCollection onFileSelect={handleFileSelection} />
        <div className={`transition-all duration-300 ${activePanel ? "w-[42%]" : "flex-1"}`}>
          <ChatBox />
        </div>
        <RightButtons onViewChange={handleViewChange} activeView={activePanel} />
        <RightPanel activePanel={activePanel} selectedFiles={selectedFiles} />
      </div>
    </main>
  )
}

