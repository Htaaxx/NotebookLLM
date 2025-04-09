"use client"

import type React from "react"

import { ThemeSelector } from "../components/theme-selector"
import { Button } from "@/components/ui/button"
import { Download, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

interface MindMapTaskbarProps {
  currentTheme: string
  onThemeChange: (themeName: string) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  containerRef: React.RefObject<HTMLDivElement>
}

export function MindMapTaskbar({
  currentTheme,
  onThemeChange,
  onZoomIn,
  onZoomOut,
  onReset,
  containerRef,
}: MindMapTaskbarProps) {
  const handleExportPDF = async () => {
    if (!containerRef.current) return

    try {
      // Create a clone of the mind map for export
      const element = containerRef.current

      // Use html2canvas to capture the mind map
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: null,
      })

      // Calculate dimensions
      const imgData = canvas.toDataURL("image/png")
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4")
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

      // Save the PDF
      pdf.save("mindmap.pdf")
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Failed to export PDF. Please try again.")
    }
  }

  return (
    <div className="flex items-center justify-between p-2 border-b bg-white">
      <div className="flex items-center space-x-2">
        <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onZoomOut} className="h-9 w-9 p-0" title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" onClick={onZoomIn} className="h-9 w-9 p-0" title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" onClick={onReset} className="h-9 w-9 p-0" title="Reset View">
          <RefreshCw className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" onClick={handleExportPDF} className="h-9 px-3" title="Export as PDF">
          <Download className="h-4 w-4 mr-1" />
          <span>Export</span>
        </Button>
      </div>
    </div>
  )
}
