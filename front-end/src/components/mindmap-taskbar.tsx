"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ZoomIn, ZoomOut, RotateCcw, Download, Save } from "lucide-react"
import { allThemes } from "../lib/mind-elixir-themes"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface MindMapTaskbarProps {
  currentTheme: string
  onThemeChange: (theme: string) => void
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
  const [isExporting, setIsExporting] = React.useState(false)

  const exportToPDF = async () => {
    if (!containerRef.current || !containerRef.current._mindElixirInstance) {
      console.error("Mind map not initialized")
      return
    }

    setIsExporting(true)

    try {
      const me = containerRef.current._mindElixirInstance

      // Store current scale and position
      const currentScale = me.scaleVal
      const currentTranslate = { x: me.translateX, y: me.translateY }

      // Reset view to show the entire mindmap
      me.scale(0.8) // Scale to fit more content
      me.toCenter() // Center the mindmap

      // Wait for the DOM to update
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Get the map container (not just the visible part)
      const mapContainer = containerRef.current.querySelector(".map-container") || containerRef.current
      const mapRoot = mapContainer.querySelector(".root") || mapContainer

      // Calculate the bounding box of all nodes to capture the entire mindmap
      const nodes = mapContainer.querySelectorAll(".node")
      let minX = Number.POSITIVE_INFINITY,
        minY = Number.POSITIVE_INFINITY,
        maxX = Number.NEGATIVE_INFINITY,
        maxY = Number.NEGATIVE_INFINITY

      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect()
        minX = Math.min(minX, rect.left)
        minY = Math.min(minY, rect.top)
        maxX = Math.max(maxX, rect.right)
        maxY = Math.max(maxY, rect.bottom)
      })

      // Add padding
      const padding = 50
      minX -= padding
      minY -= padding
      maxX += padding
      maxY += padding

      // Calculate dimensions
      const width = maxX - minX
      const height = maxY - minY

      // Create a canvas with the calculated dimensions
      const canvas = await html2canvas(mapRoot as HTMLElement, {
        scale: 2, // Higher resolution
        width: width,
        height: height,
        x: minX,
        y: minY,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      // Create PDF with appropriate dimensions
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      })

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
      pdf.save("mindmap.pdf")

      // Restore original view
      me.scale(currentScale)
      me.translateX = currentTranslate.x
      me.translateY = currentTranslate.y
      me.refresh()
    } catch (err) {
      console.error("Error exporting to PDF:", err)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToImage = async () => {
    if (!containerRef.current || !containerRef.current._mindElixirInstance) {
      console.error("Mind map not initialized")
      return
    }

    setIsExporting(true)

    try {
      const me = containerRef.current._mindElixirInstance

      // Store current scale and position
      const currentScale = me.scaleVal
      const currentTranslate = { x: me.translateX, y: me.translateY }

      // Reset view to show the entire mindmap
      me.scale(0.8) // Scale to fit more content
      me.toCenter() // Center the mindmap

      // Wait for the DOM to update
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Get the map container (not just the visible part)
      const mapContainer = containerRef.current.querySelector(".map-container") || containerRef.current
      const mapRoot = mapContainer.querySelector(".root") || mapContainer

      // Calculate the bounding box of all nodes to capture the entire mindmap
      const nodes = mapContainer.querySelectorAll(".node")
      let minX = Number.POSITIVE_INFINITY,
        minY = Number.POSITIVE_INFINITY,
        maxX = Number.NEGATIVE_INFINITY,
        maxY = Number.NEGATIVE_INFINITY

      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect()
        minX = Math.min(minX, rect.left)
        minY = Math.min(minY, rect.top)
        maxX = Math.max(maxX, rect.right)
        maxY = Math.max(maxY, rect.bottom)
      })

      // Add padding
      const padding = 50
      minX -= padding
      minY -= padding
      maxX += padding
      maxY += padding

      // Calculate dimensions
      const width = maxX - minX
      const height = maxY - minY

      // Create a canvas with the calculated dimensions
      const canvas = await html2canvas(mapRoot as HTMLElement, {
        scale: 2, // Higher resolution
        width: width,
        height: height,
        x: minX,
        y: minY,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      // Download the image
      const link = document.createElement("a")
      link.download = "mindmap.png"
      link.href = canvas.toDataURL("image/png")
      link.click()

      // Restore original view
      me.scale(currentScale)
      me.translateX = currentTranslate.x
      me.translateY = currentTranslate.y
      me.refresh()
    } catch (err) {
      console.error("Error exporting to image:", err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 border-b">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Theme:</span>
        <Select value={currentTheme} onValueChange={onThemeChange}>
          <SelectTrigger className="w-[150px] h-8">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            {allThemes.map((theme) => (
              <SelectItem key={theme.name} value={theme.name}>
                {theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={onZoomIn} title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onZoomOut} title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onReset} title="Reset View">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={exportToPDF} disabled={isExporting} title="Export to PDF">
          <Download className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">PDF</span>
        </Button>
        <Button variant="outline" size="sm" onClick={exportToImage} disabled={isExporting} title="Export to Image">
          <Save className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Image</span>
        </Button>
      </div>
    </div>
  )
}
