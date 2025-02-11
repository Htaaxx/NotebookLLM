"use client"

interface RightPanelProps {
  activePanel: "preview" | "mindmap" | null
  selectedFiles: string[]
}

export function RightPanel({ activePanel, selectedFiles }: RightPanelProps) {
  if (!activePanel) return null

  if (selectedFiles.length === 0) {
    return (
      <div className="h-full border-l p-4 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">No chosen file</p>
      </div>
    )
  }

  return (
    <div className="h-full border-l p-4">
      {activePanel === "preview" && (
        <div className="h-full bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground">PDF Preview</p>
          {/* Add your PDF preview component here */}
        </div>
      )}

      {activePanel === "mindmap" && (
        <div className="h-full bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Mind Map View</p>
          {/* Add your mind map component here */}
        </div>
      )}
    </div>
  )
}

