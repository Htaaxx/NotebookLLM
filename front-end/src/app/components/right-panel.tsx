"use client"

import { useState, useEffect } from "react"
import { ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/app/components/ui/button"

interface FileItem {
  id: string
  name: string
  type: string
  url: string
  size: number
}

interface RightPanelProps {
  activePanel: "preview" | "mindmap" | null
  selectedFiles: FileItem[]
}

const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10MB

export function RightPanel({ activePanel, selectedFiles }: RightPanelProps) {
  const [scale, setScale] = useState(1.0)
  const [error, setError] = useState<string | null>(null)

  const selectedPdf = selectedFiles.find(
    (file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"),
  )

  useEffect(() => {
    setScale(1.0)
    setError(null)
  }, [])

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

  return (
    <div className="w-[42%] border-l h-[calc(100vh-64px)] p-4 flex flex-col">
      {activePanel === "preview" && selectedPdf && (
        <>
          {/* <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">PDF Preview: {selectedPdf.name}</h2>
            <div className="flex gap-2">
              <Button onClick={handleZoomOut} size="sm">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button onClick={handleZoomIn} size="sm">
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div> */}
          <div className="flex-grow overflow-auto">
            {selectedPdf.size > MAX_PDF_SIZE ? (
              <p className="text-red-500">This PDF is too large to preview (max 10MB). Please download to view.</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <iframe
                src={`${selectedPdf.url}#toolbar=0`}
                style={{ width: "100%", height: "100%", transform: `scale(${scale})`, transformOrigin: "top left", overflow: "hidden", border: "none" }}
                className="no-scrollbars"
                title="PDF Viewer"
              ></iframe>
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
