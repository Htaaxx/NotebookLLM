"use client"

import type React from "react"
import { useState } from "react"
import { ThemeSelector } from "../components/theme-selector"
import { Button } from "@/components/ui/button"
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  ChevronDown,
  Search,
  X
} from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

// Add a type definition for nodes
interface MindMapNode {
  id: string
  topic: string
  level: number
  detailContent?: string
}

interface MindMapTaskbarProps {
  currentTheme: string
  onThemeChange: (themeName: string) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  containerRef: React.RefObject<HTMLDivElement>
  nodes: MindMapNode[] // Add nodes prop
  onNodeSelect: (node: MindMapNode) => void // Add node selection handler
  onNodeSearch: (node: MindMapNode) => void // For search functionality
  searchPaths: string[][] // Selected paths from root to node
  onRemoveSearchPath?: (index: number) => void // To remove search paths
}

export function MindMapTaskbar({
  currentTheme,
  onThemeChange,
  onZoomIn,
  onZoomOut,
  onReset,
  containerRef,
  nodes,
  onNodeSelect,
  onNodeSearch,
  searchPaths,
  onRemoveSearchPath
}: MindMapTaskbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  // Group nodes by level for better organization
  const groupedNodes = nodes.reduce((groups: { [key: number]: MindMapNode[] }, node) => {
    const level = node.level || 0;
    if (!groups[level]) {
      groups[level] = [];
    }
    groups[level].push(node);
    return groups;
  }, {});

  
  return (
    <div className="flex items-center justify-between p-2 border-b bg-white">
      <div className="flex items-center space-x-2">
        <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
        
        {/* Add node selector dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>Select Node</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </Button>
          
          {isDropdownOpen && (
            <div className="absolute z-50 mt-1 w-64 bg-white border rounded-md shadow-lg max-h-80 overflow-y-auto">
              {Object.entries(groupedNodes).sort(([a], [b]) => Number(a) - Number(b)).map(([level, nodeList]) => (
                <div key={level} className="px-1">
                  <div className="text-xs text-gray-500 py-1 px-2 bg-gray-50">
                    {level === "0" ? "Root" : `Level ${level}`}
                  </div>
                  {nodeList.map(node => (
                    <div key={node.id} className="flex items-center justify-between w-full hover:bg-green-50">
                      <button
                        className="text-left px-3 py-2 text-sm truncate flex-grow"
                        onClick={() => {
                          onNodeSelect(node);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {node.topic}
                      </button>
                      <button 
                        className="p-1 hover:bg-blue-100 rounded mr-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNodeSearch(node);
                          // Don't close dropdown so user can select multiple nodes
                        }}
                        title="Add to search paths"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Existing buttons */}
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