"use client"

import { useState } from "react"
import { NavBar } from "@/app/components/nav-bar"
import { FileCollection } from "@/app/components/file-collection"
import { ChatBox } from "@/app/components/chat-box"
import { RightPanel } from "@/app/components/right-panel"
import { RightButtons } from "@/app/components/right-buttons"

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [activePanel, setActivePanel] = useState<"preview" | "mindmap" | null>(null)

  const handleViewChange = (view: "preview" | "mindmap" | null) => {
    setActivePanel(view)
  }

  return (
    <main className="h-screen flex flex-col">
      <NavBar />
      <div className="flex flex-1 relative">
        <FileCollection />
        <div className={`transition-all duration-300 ${activePanel ? "w-[42%]" : "flex-1"}`}>
          <ChatBox />
        </div>
        <RightButtons onViewChange={handleViewChange} activeView={activePanel} />
        {activePanel && (
          <div className="w-[42%]">
            <RightPanel activePanel={activePanel} selectedFiles={selectedFiles} />
          </div>
        )}
      </div>
    </main>
  )
}

