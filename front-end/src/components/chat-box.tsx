"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronUp, Send, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ChatBox() {
  const [showSettings, setShowSettings] = useState(false)
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<string[]>([])

  const chatEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatHistory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    try {
      await sendMessageToBackend(message)
      setChatHistory((prev) => [...prev, message])
      setMessage("")
    } catch (error) {
      console.error("Failed to send message", error)
    }
  }

  const sendMessageToBackend = async (message: string) => {
    console.log("Sending message to backend:", message)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {chatHistory.map((msg, index) => (
          <div key={index} className="flex justify-end mb-2">
            <div className="bg-green-500 text-white p-3 rounded-2xl rounded-tr-none max-w-[80%]">{msg}</div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            Chat settings
            {showSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showSettings && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm">Chat settings panel</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1"
          />
          <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
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

