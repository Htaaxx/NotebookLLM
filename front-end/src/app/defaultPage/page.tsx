"use client"

import { useState, useCallback, useEffect } from "react"
import { NavBar } from "@/components/nav-bar"
import { FileCollection } from "@/components/file-collection"
import { ChatBox } from "@/components/chat-box"
import { RightPanel } from "@/components/right-panel"
import { RightButtons } from "@/components/right-buttons"
import type { FileItem } from "@/types/app-types"

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([])
  const [activePanel, setActivePanel] = useState<"preview" | "mindmap" | "cheatsheet" | null>(null)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)

  const handleFileSelection = useCallback((files: FileItem[]) => {
    setSelectedFiles(files)
  }, [])

  const handleViewChange = useCallback((view: "preview" | "mindmap" | "cheatsheet" | null) => {
    setActivePanel((prev) => (prev === view ? null : view))
  }, [])

  // Check for file preview from localStorage on component mount
  useEffect(() => {
    try {
      const storedFile = localStorage.getItem("previewFile")
      const showPdfPreview = localStorage.getItem("showPdfPreview")

      if (storedFile) {
        const file = JSON.parse(storedFile) as FileItem
        setSelectedFiles([file])
        setPreviewFile(file)

        // If showPdfPreview flag is set, automatically open the preview panel
        if (showPdfPreview === "true") {
          setActivePanel("preview")
          // Clear the flag after using it
          localStorage.removeItem("showPdfPreview")
        }

        // Clear the stored file to prevent it from showing again on refresh
        localStorage.removeItem("previewFile")
      }
    } catch (error) {
      console.error("Error parsing stored file:", error)
    }
  }, [])

  // Add an effect to listen for file deletion events
  // Add this near your other useEffect hooks

  useEffect(() => {
    const handleFileDeleted = (event: CustomEvent) => {
      const deletedFileId = event.detail.fileId

      // If the currently previewed file is deleted, clear the preview
      if (previewFile && previewFile.id === deletedFileId) {
        setPreviewFile(null)
        localStorage.removeItem("previewFile")
        localStorage.removeItem("showPdfPreview")
      }

      // Update selected files list if needed
      setSelectedFiles((prev) => prev.filter((file) => file.id !== deletedFileId))
    }

    // Add event listener
    window.addEventListener("fileDeleted", handleFileDeleted as EventListener)

    // Clean up
    return () => {
      window.removeEventListener("fileDeleted", handleFileDeleted as EventListener)
    }
  }, [previewFile])

  return (
    <main className="min-h-screen flex flex-col bg-white text-black">
      <NavBar />
      <div className="flex flex-1 relative">
        <div className="w-64 border-r h-[calc(100vh-64px)] bg-white">
          <FileCollection onFileSelect={handleFileSelection} />
        </div>
        <div className={`transition-all duration-300 bg-white ${activePanel ? "w-[42%]" : "flex-1"}`}>
          <ChatBox />
        </div>
        <RightButtons onViewChange={handleViewChange} activeView={activePanel} />
        <RightPanel activePanel={activePanel} selectedFiles={selectedFiles} />
      </div>
    </main>
  )
}

