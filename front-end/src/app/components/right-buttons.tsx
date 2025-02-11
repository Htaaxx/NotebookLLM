"use client"
import { FileText, Network } from "lucide-react"
import { Button } from "@/app/components/ui/button"

interface RightButtonsProps {
  onViewChange: (view: "preview" | "mindmap" | null) => void
  activeView: "preview" | "mindmap" | null
}

export function RightButtons({ onViewChange, activeView }: RightButtonsProps) {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
      <Button
        variant={activeView === "preview" ? "default" : "outline"}
        size="icon"
        onClick={() => onViewChange(activeView === "preview" ? null : "preview")}
        className="rounded-full w-10 h-10"
      >
        <FileText className="w-4 h-4" />
      </Button>
      <Button
        variant={activeView === "mindmap" ? "default" : "outline"}
        size="icon"
        onClick={() => onViewChange(activeView === "mindmap" ? null : "mindmap")}
        className="rounded-full w-10 h-10"
      >
        <Network className="w-4 h-4" />
      </Button>
    </div>
  )
}

