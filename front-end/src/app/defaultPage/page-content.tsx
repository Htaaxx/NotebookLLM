"use client"

import { useState, useCallback, useEffect } from "react"
import { NavBar } from "@/components/nav-bar"
import { FileCollection } from "@/components/file-collection"
import { ChatBox } from "@/components/chat-box"
import { RightPanel } from "@/components/right-panel"
import { RightButtons } from "@/components/right-buttons"
import type { FileItem } from "@/types/app-types"
import { EmbeddingProvider, useEmbedding } from "@/components/embedding-context"

// Create a content component that uses the embedding context
function PageContent() {
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([])
  const [activePanel, setActivePanel] = useState<"preview" | "mindmap" | "cheatsheet" | null>(null)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [files, setFiles] = useState<FileItem[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleFileSelection = useCallback((files: FileItem[]) => {
    setSelectedFiles(files)
  }, [])

  const handleViewChange = useCallback((view: "preview" | "mindmap" | "cheatsheet" | null) => {
    setActivePanel((prev) => (prev === view ? null : view))
  }, [])

  const { status: embeddingStatus } = useEmbedding()
  const isFeatureDisabled = embeddingStatus === "embedding"

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

  // Add an effect to listen for sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarOpen(event.detail.isOpen)
    }

    window.addEventListener("sidebarToggle", handleSidebarToggle as EventListener)

    return () => {
      window.removeEventListener("sidebarToggle", handleSidebarToggle as EventListener)
    }
  }, [])

  return (
    <main className="min-h-screen flex flex-col bg-[#86AB5D] text-white">
      <NavBar />
      {/* Embedding Progress Notification */}
      {embeddingStatus === "embedding" && (
        <div className="bg-[#86AB5D]/30 p-2 text-center text-sm text-white border border-[#86AB5D]">
          Processing documents... Please wait before using mindmap or cheatsheet features.
        </div>
      )}
  
      <div className="flex flex-1 relative">
        <div className="h-[calc(100vh-64px)] bg-[#86AB5D]">
          <FileCollection onFileSelect={handleFileSelection} key={`file-collection-${refreshTrigger}`} />
        </div>
        <div
          className={`transition-all duration-300 bg-[#86AB5D] ${activePanel ? (sidebarOpen ? "w-[42%]" : "w-[50%]") : "flex-1"}`}
        >
          <ChatBox isDisabled={isFeatureDisabled} />
        </div>
        {/* Position RightButtons absolutely to prevent layout issues */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50">
          <RightButtons 
            onViewChange={handleViewChange} 
            activeView={activePanel} 
            isDisabled={isFeatureDisabled} 
          />
        </div>
        <RightPanel 
          activePanel={activePanel} 
          selectedFiles={selectedFiles} 
          onViewChange={handleViewChange} 
          isDisabled={isFeatureDisabled}
        />
      </div>
    </main>
  )
}

// Wrap the component with EmbeddingProvider
export default function DefaultPageContent() {
  return (
    <EmbeddingProvider>
      <PageContent />
    </EmbeddingProvider>
  )
}