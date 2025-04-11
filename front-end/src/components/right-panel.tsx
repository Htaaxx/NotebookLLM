"use client"

import { useState, useEffect, useMemo } from "react"
import { ZoomIn, ZoomOut, Highlighter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MindMapView } from "@/components/mindmap-view"
import { useLanguage } from "@/lib/language-context"
import { motion, AnimatePresence } from "framer-motion"
import { fadeIn, buttonAnimation } from "@/lib/motion-utils"
import { PdfPreview } from "@/components/pdf-preview"
import "@/styles/pdf-preview.css"
// Import the CheatsheetView component at the top of the file
import { CheatsheetView } from "@/components/cheatsheet-view"
// Add this import near the top of the file with the other imports
import "@/styles/cheatsheet.css"

interface FileItem {
  id: string
  name: string
  type: string
  url: string
  size: number
}

interface Annotation {
  page: number
  text: string
  x: number
  y: number
  width: number
  height: number
}

interface RightPanelProps {
  activePanel: "preview" | "mindmap" | "cheatsheet" | null
  selectedFiles: FileItem[]
}

export function RightPanel({ activePanel, selectedFiles }: RightPanelProps) {
  const [scale, setScale] = useState(1.0)
  const [error, setError] = useState<string | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectedPage, setSelectedPage] = useState<number | null>(null)
  const [markdownContent, setMarkdownContent] = useState<string>("")
  const { t } = useLanguage()
  // Add a state to track sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(true)

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

  const selectedPdf = useMemo(() => {
    return (
      selectedFiles.find((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) || null
    )
  }, [selectedFiles])

  const selectedMarkdownFile = useMemo(() => {
    return (
      selectedFiles.find((file) => file.type === "text/markdown" || file.name.toLowerCase().endsWith(".md")) || null
    )
  }, [selectedFiles])

  const selectedImage = useMemo(() => {
    return selectedFiles.find((file) => file.type.startsWith("image/")) || null
  }, [selectedFiles])

  const selectedVideo = useMemo(() => {
    return selectedFiles.find((file) => file.type.startsWith("video/")) || null
  }, [selectedFiles])

  const selectedOtherFile = useMemo(() => {
    return (
      selectedFiles.find(
        (file) =>
          !file.type.startsWith("image/") &&
          !file.type.startsWith("video/") &&
          !file.type.includes("pdf") &&
          !file.type.includes("markdown"),
      ) || null
    )
  }, [selectedFiles])

  useEffect(() => {
    if (!selectedFiles) {
      setError(null)
      setScale(1.0)
    }
  }, [selectedFiles])

  useEffect(() => {
    setScale(1.0)
    setError(null)
  }, [selectedFiles])

  useEffect(() => {
    if (activePanel === "mindmap") {
      console.log("MindMap panel active, triggering refresh if needed")

      // Reset error state
      setError(null)

      // Trigger a file selection changed event to refresh the mindmap if needed
      window.dispatchEvent(
        new CustomEvent("fileSelectionChanged", {
          detail: {
            refreshMindmap: true,
            action: selectedFiles && selectedFiles.length > 0 ? "select" : "deselect",
            fileIds: selectedFiles ? selectedFiles.map((file) => file.id) : [],
          },
        }),
      )

      // If there's a selected file, try to load it
      if (selectedMarkdownFile) {
        console.log("Attempting to load markdown from file:", selectedMarkdownFile.name)

        fetch(selectedMarkdownFile.url)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to load markdown: ${response.status}`)
            }
            return response.text()
          })
          .then((text) => {
            if (text && text.trim()) {
              console.log("Successfully loaded markdown, length:", text.length)
              setMarkdownContent(text)
            } else {
              console.warn("Loaded empty markdown, keeping default")
            }
          })
          .catch((err) => {
            console.error("Failed to load markdown from file:", err)
            setError(`Failed to load markdown: ${err.message}`)
          })
      }
    }
  }, [activePanel, selectedMarkdownFile, selectedFiles])

  const handleHighlightText = () => {
    if (selectedPage === null) return

    const selection = window.getSelection()
    if (selection && selection.toString().trim() !== "") {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      // Adjust coordinates based on scale and page container
      const pdfContainer = document.getElementById(`page-container-${selectedPage}`)
      if (pdfContainer) {
        const containerRect = pdfContainer.getBoundingClientRect()
        const x = (rect.left - containerRect.left) / scale
        const y = (rect.top - containerRect.top) / scale

        setAnnotations((prev) => [
          ...prev,
          {
            page: selectedPage,
            text: selection.toString(),
            x,
            y,
            width: rect.width / scale,
            height: rect.height / scale,
          },
        ])

        // Clear selection after highlighting
        selection.removeAllRanges()
      }
    }
  }

  if (!activePanel) return null

  if (!activePanel || (selectedFiles.length === 0 && activePanel !== "mindmap")) {
    return (
      <motion.div
        className="w-[42%] border-l h-[calc(100vh-64px)] p-4 flex items-center justify-center bg-white text-black"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-lg text-gray-500">{t("noChosenFile")}</p>
      </motion.div>
    )
  }

  const handleZoomIn = () => setScale((prevScale) => Math.min(prevScale + 0.1, 2))
  const handleZoomOut = () => setScale((prevScale) => Math.max(prevScale - 0.1, 0.5))

  return (
    <motion.div
      className={`${sidebarOpen ? "w-[42%]" : "w-[50%]"} border-l h-[calc(100vh-64px)] p-4 flex flex-col bg-white text-black overflow-hidden`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {activePanel === "preview" && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-grow flex flex-col overflow-hidden"
          >
            <motion.div variants={fadeIn("down", 0.1)} initial="hidden" animate="show">
              {!selectedPdf && (
                <div className="flex gap-2">
                  <motion.div whileHover="hover" whileTap="tap" variants={buttonAnimation}>
                    <Button onClick={handleZoomOut} size="sm" className="bg-white text-black hover:bg-gray-100">
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover="hover" whileTap="tap" variants={buttonAnimation}>
                    <Button onClick={handleZoomIn} size="sm" className="bg-white text-black hover:bg-gray-100">
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover="hover" whileTap="tap" variants={buttonAnimation}>
                    <Button
                      onClick={handleHighlightText}
                      size="sm"
                      title="Highlight Selected Text"
                      className="bg-white text-black hover:bg-gray-100"
                    >
                      <Highlighter className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              )}
            </motion.div>

            <motion.div
              className="flex-grow overflow-hidden"
              variants={fadeIn("up", 0.2)}
              initial="hidden"
              animate="show"
            >
              {selectedPdf && (
                <div className="h-full">
                  <PdfPreview url={selectedPdf.url} fileName={selectedPdf.name} />
                </div>
              )}

              {selectedImage && (
                <motion.div
                  className="flex justify-center overflow-auto h-full"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src={selectedImage.url || "/placeholder.svg"}
                    alt={selectedImage.name}
                    className="max-w-full max-h-[500px] rounded-lg shadow-lg"
                  />
                </motion.div>
              )}

              {selectedVideo && (
                <motion.div
                  className="flex justify-center overflow-auto h-full"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <video controls className="max-w-full max-h-[500px] rounded-lg shadow-lg">
                    <source src={selectedVideo.url} type={selectedVideo.type} />
                    Your browser does not support the video tag.
                  </video>
                </motion.div>
              )}

              {selectedOtherFile && (
                <motion.div className="text-center mt-4" variants={fadeIn("up", 0.3)} initial="hidden" animate="show">
                  <p className="text-muted-foreground">Preview is not available for this file type.</p>
                  <motion.a
                    href={selectedOtherFile.url}
                    download
                    className="text-blue-500 underline"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Download {selectedOtherFile.name}
                  </motion.a>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}

        {activePanel === "mindmap" && (
          <motion.div
            key="mindmap"
            className="h-full bg-white rounded-lg grid grid-rows-[auto_1fr]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex items-center mb-4 bg-green-500 text-black py-2 px-4 rounded-md"
              variants={fadeIn("down", 0.1)}
              initial="hidden"
              animate="show"
            >
              <h2 className="flex-grow text-center font-medium">
                {selectedMarkdownFile ? selectedMarkdownFile.name : "Mind Map View"}
              </h2>
            </motion.div>
            <motion.div
              className="min-h-0 relative flex-grow"
              variants={fadeIn("up", 0.2)}
              initial="hidden"
              animate="show"
            >
              {error ? (
                <div className="p-4 text-red-500">{error}</div>
              ) : (
                <MindMapView
                  markdownContent={markdownContent || undefined}
                  className="absolute inset-0"
                  selectedFiles={selectedFiles}
                />
              )}
            </motion.div>
          </motion.div>
        )}

        {activePanel === "cheatsheet" && (
          <motion.div
            key="cheatsheet"
            className="h-full bg-white rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CheatsheetView initialMarkdown={selectedMarkdownFile ? markdownContent : undefined} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
