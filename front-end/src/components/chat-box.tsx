"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronUp, Send, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/language-context"

export function ChatBox() {
  const [showSettings, setShowSettings] = useState(false)
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<string[]>([])
  const { t } = useLanguage()

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
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white text-black">
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
      <div className="border-t p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            {t("chatSettings")}
            {showSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showSettings && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm">{t("chatSettings")}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("typeMessage")}
            className="flex-1 bg-white text-black border-gray-300"
          />
          <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
            <Send className="w-4 h-4 mr-2" />
            {t("send")}
          </Button>
          <Button type="button" variant="outline" className="border-gray-300 text-black">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("regenerate")}
          </Button>
        </form>
      </div>
    </div>
  )
}

