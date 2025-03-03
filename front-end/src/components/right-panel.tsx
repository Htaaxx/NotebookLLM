"use client"

import { useState, useEffect, useMemo } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { ZoomIn, ZoomOut, Highlighter } from "lucide-react"
import { Button } from "@/components/ui/button"
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

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
  activePanel: "preview" | "mindmap" | null
  selectedFiles: FileItem[]
}

const MAX_PDF_SIZE = 100 * 1024 * 1024 // Allow pdf to be only < 100MB

export function RightPanel({ activePanel, selectedFiles }: RightPanelProps) {
  const [scale, setScale] = useState(1.0)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectedPage, setSelectedPage] = useState<number | null>(null)

  const selectedPdf = useMemo(() => {
    return selectedFiles.find(
      (file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    ) || null;
  }, [selectedFiles]);
  
  useEffect(() => {
    if (!selectedPdf) {
      setNumPages(null);
      setError(null);
      setScale(1.0);
    }
  }, [selectedPdf]);
  

  useEffect(() => {
    setScale(1.0)
    setError(null)
  }, [selectedPdf])

  const formattedPdfName = useMemo(() => {
    return selectedPdf?.name.replace(/\.pdf$/i, "")
  }, [selectedPdf?.name])

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

  if (selectedFiles.length === 0) {
    return (
      <div className="w-[42%] border-l h-[calc(100vh-64px)] p-4 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">No chosen file</p>
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
    <div className="w-[42%] border-l h-[calc(100vh-64px)] p-4 flex flex-col">
      {activePanel === "preview" && selectedPdf && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-center bg-green-500 text-white uppercase py-2 px-4 rounded-md w-full">
              {formattedPdfName}
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
            {selectedPdf.size > MAX_PDF_SIZE ? (
              <p className="text-red-500">This PDF is too large to preview (max 100MB). Please download to view.</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <Document
                file={selectedPdf.url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(err) => setError(`Failed to load PDF: ${err.message}`)}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <div
                    key={`page-container-${index + 1}`}
                    id={`page-container-${index + 1}`}
                    style={{ position: "relative" }}
                  >
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      scale={scale}
                      onRenderSuccess={() => onPageRendered(index + 1)}
                    />
                    {annotations
                      .filter((annotation) => annotation.page === index + 1)
                      .map((annotation, i) => (
                        <div
                          key={`annotation-${i}`}
                          style={{
                            position: "absolute",
                            top: annotation.y * scale,
                            left: annotation.x * scale,
                            width: annotation.width * scale,
                            height: annotation.height * scale,
                            backgroundColor: "rgba(255, 255, 0, 0.5)",
                            pointerEvents: "none",
                          }}
                        />
                      ))}
                  </div>
                ))}
              </Document>
            )}
          </div>
        </>
      )}

      {activePanel === "mindmap" && (
        <div className="h-full bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Mind Map View</p>
        </div>
      )}
    </div>
  )
}
