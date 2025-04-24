"use client"

import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { ZoomIn, ZoomOut, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { buttonAnimation } from "@/lib/motion-utils"
import "react-pdf/dist/esm/Page/TextLayer.css"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import { 
  FileSearch,       // PDF Review icon - thể hiện tìm kiếm trong file
  BrainCircuit,     // Mind Map icon - thể hiện kết nối thông tin
  ClipboardList     // Cheatsheet icon - thể hiện danh sách tóm tắt
} from "lucide-react"

// Set worker options for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

interface PdfPreviewProps {
  url: string
  fileName?: string
}

export function PdfPreview({ url, fileName}: PdfPreviewProps) {
  const [scale, setScale] = useState(1.0)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleZoomIn = () => setScale((prevScale) => Math.min(prevScale + 0.1, 2))
  const handleZoomOut = () => setScale((prevScale) => Math.max(prevScale - 0.1, 0.5))

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setIsLoading(false)
  }

  const onDocumentLoadError = () => {
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2 bg-green-500 text-white p-3 rounded-md">
        <div className="flex items-center">
          <File className="w-5 h-5 mr-2" />
          <span className="font-medium text-black">{fileName}</span>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover="hover" whileTap="tap" variants={buttonAnimation}>
            <Button
              onClick={handleZoomOut}
              size="sm"
              title="Zoom Out"
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </motion.div>
          <motion.div whileHover="hover" whileTap="tap" variants={buttonAnimation}>
            <Button
              onClick={handleZoomIn}
              size="sm"
              title="Zoom In"
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="pdf-container flex-1 overflow-auto bg-gray-100 rounded-md">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className="text-center py-10">Loading PDF...</div>}
          error={<div className="text-center py-10 text-red-500">Failed to load PDF</div>}
          className="pdf-document"
        >
          {Array.from(new Array(numPages), (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="pdf-page mb-4"
            />
          ))}
        </Document>
      </div>
    </div>
  )
}

