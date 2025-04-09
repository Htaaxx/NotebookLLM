"use client"

import React from "react"
import { FileText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MindMapNodeOptionsProps {
  position: { x: number; y: number }
  onDetail: () => void
  onSearch: () => void
  visible: boolean
  className?: string // Make sure to include className in the props interface
}

export function MindMapNodeOptions({ position, onDetail, onSearch, visible, className }: MindMapNodeOptionsProps) {
  if (!visible) return null

  return (
    <div 
      className={`absolute z-50 bg-white rounded-md shadow-lg border flex ${className || ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <Button 
        onClick={onDetail}
        variant="ghost"
        className="flex items-center gap-2 p-2 hover:bg-gray-100"
        title="View Details"
      >
        <FileText className="h-4 w-4" />
        <span>Detail</span>
      </Button>
      
      <div className="w-px h-full bg-gray-200" />
      
      <Button 
        onClick={onSearch}
        variant="ghost" 
        className="flex items-center gap-2 p-2 hover:bg-gray-100"
        title="Search"
      >
        <Search className="h-4 w-4" />
        <span>Search</span>
      </Button>
    </div>
  )
}