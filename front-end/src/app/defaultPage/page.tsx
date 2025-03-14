"use client"

import { useState, useCallback } from "react"
import { NavBar } from "@//components/nav-bar"
import { FileCollection } from "@/components/file-collection"
import { ChatBox } from "@/components/chat-box"
import { RightPanel } from "@/components/right-panel"
import { RightButtons } from "@/components/right-buttons"

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
  const [activePanel, setActivePanel] = useState<"preview" | "mindmap" | "cheatsheet" | null>(null)

  const handleFileSelection = useCallback((files: FileItem[]) => {
    setSelectedFiles(files);
  }, []);
  
  

  const handleViewChange = useCallback((view: "preview" | "mindmap" | "cheatsheet" | null) => {
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

