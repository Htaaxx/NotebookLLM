"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Send, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ChatBox() {
  const [showSettings, setShowSettings] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle message submission
    setMessage("")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      <div className="flex-1 p-4 overflow-y-auto">{/* Chat messages will appear here */}</div>

      <div className="border-t p-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Chat settings
            {showSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showSettings && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            {/* Chat settings content */}
            <p className="text-sm">Chat settings panel</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1"
          />
          <Button type="submit">
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
          <Button type="button" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Regen
          </Button>
        </form>
      </div>
    </div>
  )
}