"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronUp, Send, RefreshCw, Settings, FileText, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/language-context"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ChatBox() {
  const [showSettings, setShowSettings] = useState(false)
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<string[]>([])
  const { t } = useLanguage()

  // Chat settings state
  const [model, setModel] = useState("gpt-4o")
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4000)
  const [useRAG, setUseRAG] = useState(true)
  const [useSummary, setUseSummary] = useState(true)
  const [contextWindow, setContextWindow] = useState(10)

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
    console.log("Using settings:", {
      model,
      temperature,
      maxTokens,
      useRAG,
      useSummary,
      contextWindow,
    })
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
            <Settings className="w-4 h-4 mr-1" />
            {t("chatSettings")}
            {showSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showSettings && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">AI Model Settings</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Model</label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Tokens</label>
                  <Select value={maxTokens.toString()} onValueChange={(value) => setMaxTokens(Number.parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Max tokens" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">1,000</SelectItem>
                      <SelectItem value="2000">2,000</SelectItem>
                      <SelectItem value="4000">4,000</SelectItem>
                      <SelectItem value="8000">8,000</SelectItem>
                      <SelectItem value="16000">16,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Temperature: {temperature.toFixed(1)}</label>
                </div>
                <Slider
                  value={[temperature]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={(value) => setTemperature(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              <Separator />

              <h3 className="text-sm font-medium">Knowledge Base Settings</h3>

              <div className="flex items-center space-x-2">
                <Checkbox id="use-rag" checked={useRAG} onCheckedChange={(checked) => setUseRAG(checked === true)} />
                <label htmlFor="use-rag" className="text-sm font-medium cursor-pointer flex items-center">
                  <FileText className="w-4 h-4 mr-1 text-green-600" />
                  Use selected files as context
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-summary"
                  checked={useSummary}
                  onCheckedChange={(checked) => setUseSummary(checked === true)}
                />
                <label htmlFor="use-summary" className="text-sm font-medium cursor-pointer flex items-center">
                  <Sparkles className="w-4 h-4 mr-1 text-amber-500" />
                  Generate summaries for long documents
                </label>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Context Window: {contextWindow} messages</label>
                </div>
                <Slider
                  value={[contextWindow]}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={(value) => setContextWindow(value[0])}
                  className="w-full"
                />
              </div>
            </div>
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

