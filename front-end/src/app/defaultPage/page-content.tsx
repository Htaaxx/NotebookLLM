"use client"

import { useState, useCallback, useEffect } from "react"
import { NavBar } from "@/components/nav-bar"
import { FileCollection } from "@/components/file-collection"
import { ChatBox } from "@/components/chat-box"
import { RightPanel } from "@/components/right-panel"
import { RightButtons } from "@/components/right-buttons"
import type { FileItem } from "@/types/app-types"

export default function DefaultPageContent() {
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([])
  const [activePanel, setActivePanel] = useState<"preview" | "mindmap" | "cheatsheet" | null>(null)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [files, setFiles] = useState<FileItem[]>([])

  const handleFileSelection = useCallback((files: FileItem[]) => {
    setSelectedFiles(files)
  }, [])

  const handleViewChange = useCallback((view: "preview" | "mindmap" | "cheatsheet" | null) => {
    setActivePanel((prev) => (prev === view ? null : view))
  }, [])

  // Check for file preview from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
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

      // Check if there's a selected file ID from the files page
      const selectedFileId = localStorage.getItem("selectedFileId")
      if (selectedFileId) {
        // Find the file in your files list and select it
        setFiles((prevFiles) => {
          const updatedFiles = prevFiles.map((file) => ({
            ...file,
            selected: file.id === selectedFileId,
          }))
          return updatedFiles
        })

        // Clear the selected file ID from localStorage
        localStorage.removeItem("selectedFileId")
      }
    }
  }, [])

  // Listen for file events to trigger refreshes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleFileUploaded = () => {
        // Trigger a refresh by updating the state
        setRefreshTrigger((prev) => prev + 1)
      }

      const handleFileDeleted = (event: CustomEvent) => {
        const deletedFileId = event.detail.fileId

        // If the currently previewed file is deleted, clear the preview
        if (previewFile && previewFile.id === deletedFileId) {
          setPreviewFile(null)
          setActivePanel(null)
          localStorage.removeItem("previewFile")
          localStorage.removeItem("showPdfPreview")
        }

        // Update selected files list if needed
        setSelectedFiles((prev) => prev.filter((file) => file.id !== deletedFileId))

        // Force a complete refresh of the FileCollection component
        setRefreshTrigger((prev) => prev + 1)
      }

      // Add event listeners
      window.addEventListener("fileUploaded", handleFileUploaded as EventListener)
      window.addEventListener("fileDeleted", handleFileDeleted as EventListener)

      // Clean up
      return () => {
        window.removeEventListener("fileUploaded", handleFileUploaded as EventListener)
        window.removeEventListener("fileDeleted", handleFileDeleted as EventListener)
      }
    }
  }, [previewFile])

  return (
    <main className="min-h-screen flex flex-col bg-white text-black">
      <NavBar />
      <div className="flex flex-1 relative">
        <div className="w-64 border-r h-[calc(100vh-64px)] bg-white">
          <FileCollection onFileSelect={handleFileSelection} key={`file-collection-${refreshTrigger}`} />
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

