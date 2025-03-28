"use client"

import { useState, useEffect, useMemo } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { ZoomIn, ZoomOut, Highlighter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MindMapView } from "@/components/mindmap-view"
import { useLanguage } from "@/lib/language-context"
import "react-pdf/dist/esm/Page/TextLayer.css"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"

// Set worker options for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

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
  const [numPages, setNumPages] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectedPage, setSelectedPage] = useState<number | null>(null)
  const [markdownContent, setMarkdownContent] = useState<string>("")
  const { t } = useLanguage()

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
      setNumPages(null)
      setError(null)
      setScale(1.0)
    }
  }, [selectedFiles])

  useEffect(() => {
    setScale(1.0)
    setError(null)
  }, [selectedFiles])

  // Đảm bảo useEffect này chạy đúng thứ tự
  useEffect(() => {
    if (activePanel === "mindmap") {
      console.log("MindMap panel active, loading default markdown content")

      // Đảm bảo reset error state
      setError(null)

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
  }, [activePanel, selectedMarkdownFile])

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
      <div className="w-[42%] border-l h-[calc(100vh-64px)] p-4 flex items-center justify-center bg-white text-black">
        <p className="text-lg text-gray-500">{t("noChosenFile")}</p>
      </div>
    )
  }

  const handleZoomIn = () => setScale((prevScale) => Math.min(prevScale + 0.1, 2))
  const handleZoomOut = () => setScale((prevScale) => Math.max(prevScale - 0.1, 0.5))

  const onDocumentLoadSuccess = (pdf: { numPages: number }) => {
    setNumPages(pdf.numPages)
  }

  const onPageRendered = (pageNumber: number) => {
    setSelectedPage(pageNumber) // Track the currently rendered page
  }

  return (
    <div className="w-[42%] border-l h-[calc(100vh-64px)] p-4 flex flex-col bg-white text-black">
      {activePanel === "preview" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-center bg-green-500 text-black py-2 px-4 rounded-md w-full mr-2">
              {selectedPdf?.name || selectedImage?.name || selectedVideo?.name || selectedOtherFile?.name}
            </h2>
            <div className="flex gap-2">
              <Button onClick={handleZoomOut} size="sm">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button onClick={handleZoomIn} size="sm">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button onClick={handleHighlightText} size="sm" title="Highlight Selected Text">
                <Highlighter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-grow overflow-auto">
            {selectedPdf && (
              <Document file={selectedPdf.url} onLoadSuccess={onDocumentLoadSuccess}>
                {Array.from(new Array(numPages), (_, index) => (
                  <Page
                    key={index}
                    pageNumber={index + 1}
                    scale={scale}
                    onRenderSuccess={() => onPageRendered(index + 1)}
                  />
                ))}
              </Document>
            )}

            {selectedImage && (
              <div className="flex justify-center">
                <img
                  src={selectedImage.url || "/placeholder.svg"}
                  alt={selectedImage.name}
                  className="max-w-full max-h-[500px] rounded-lg shadow-lg"
                />
              </div>
            )}

            {selectedVideo && (
              <div className="flex justify-center">
                <video controls className="max-w-full max-h-[500px] rounded-lg shadow-lg">
                  <source src={selectedVideo.url} type={selectedVideo.type} />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {selectedOtherFile && (
              <div className="text-center mt-4">
                <p className="text-muted-foreground">Preview is not available for this file type.</p>
                <a href={selectedOtherFile.url} download className="text-blue-500 underline">
                  Download {selectedOtherFile.name}
                </a>
              </div>
            )}
          </div>
        </>
      )}

      {activePanel === "mindmap" && (
        <div className="h-full bg-white rounded-lg grid grid-rows-[auto_1fr]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-center bg-green-500 text-black py-2 px-4 rounded-md w-full">
              {selectedMarkdownFile ? selectedMarkdownFile.name : "Mind Map View"}
            </h2>
          </div>
          <div className="min-h-0 relative flex-grow">
            {error ? (
              <div className="p-4 text-red-500">{error}</div>
            ) : (
              <MindMapView markdownContent={markdownContent || undefined} className="absolute inset-0" />
            )}
          </div>
        </div>
      )}

      {activePanel === "cheatsheet" && (
        <div className="h-full bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Cheatsheet View</p>
        </div>
      )}
    </div>
  )
}

