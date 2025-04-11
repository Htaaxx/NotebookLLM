"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  ChevronDown,
  ChevronUp,
  Send,
  RefreshCw,
  Settings,
  Search,
  X,
  Trash2,
  MoreVertical,
  Eye,
  MapPin,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/language-context"
import { motion, AnimatePresence } from "framer-motion"
import { fadeIn, buttonAnimation } from "@/lib/motion-utils"
import ReactMarkdown from "react-markdown"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ChatBox() {
  const [showSettings, setShowSettings] = useState(false)
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<Array<{ text: string; isUser: boolean }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()

  // Chat settings state
  const [model, setModel] = useState("gpt-4o")
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4000)
  const [useRAG, setUseRAG] = useState(true)
  const [useSummary, setUseSummary] = useState(true)
  const [contextWindow, setContextWindow] = useState(10)

  const chatEndRef = useRef<HTMLDivElement | null>(null)

  const [searchPaths, setSearchPaths] = useState<string[][]>([])
  const [pathSearchQuery, setPathSearchQuery] = useState("")
  const [latestSearchNode, setLatestSearchNode] = useState<{ id: string; topic: string } | null>(null)
  const [useAsContext, setUseAsContext] = useState(false)
  const [expandedPaths, setExpandedPaths] = useState(false)

  useEffect(() => {
    if (useAsContext) {
      console.log("Using mind map paths as context for chat")
      // Here you would implement the logic to use the paths as context
      // For example, you might want to include them in API requests
    }
  }, [useAsContext, searchPaths])

  useEffect(() => {
    // Handler for mind map search events
    const handleMindMapPathsUpdated = (event: any) => {
      const { paths, latestNode } = event.detail

      // Update our local state with the paths
      setSearchPaths(paths)

      // Store the latest added node for feedback
      setLatestSearchNode(latestNode)

      // Automatically expand paths when new ones are added
      setExpandedPaths(true)
    }

    // Add event listener
    window.addEventListener("mindmap_paths_updated", handleMindMapPathsUpdated)

    // Clean up function
    return () => {
      window.removeEventListener("mindmap_paths_updated", handleMindMapPathsUpdated)
    }
  }, [])

  const handleClearSearchPaths = () => {
    setSearchPaths([])
  }

  // Get the final node from a path
  const getFinalNode = (path: string[]) => {
    return path.length > 0 ? path[path.length - 1] : ""
  }

  // Get the full path as a string
  const getFullPathString = (path: string[]) => {
    return path.join(" > ")
  }

  // Filter paths based on search query
  const filteredPaths = searchPaths.filter((path) => {
    if (!pathSearchQuery) return true
    return path.some((node) => node.toLowerCase().includes(pathSearchQuery.toLowerCase()))
  })

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatHistory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const userMessage = message.trim()
    if (!userMessage) return

    setChatHistory((prev) => [...prev, { text: userMessage, isUser: true }])
    setMessage("")
    setIsLoading(true)

    try {
      // Get user_id from localStorage
      const currentUserId = localStorage.getItem("user_id") || "default_user"

      const queryApiUrl = "http://localhost:8000/query/"

      // Prepare request body
      const requestBody = {
        user_id: currentUserId,
        question: userMessage,
        // Include mind map paths as context if enabled
        context: useAsContext && searchPaths.length > 0 ? searchPaths.map((path) => path.join(" > ")) : undefined,
      }

      console.log("Sending request to:", queryApiUrl)
      console.log("Request body:", JSON.stringify(requestBody))

      const response = await fetch(queryApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        let errorDetails = `API error: ${response.status}`
        try {
          const errorData = await response.json()
          errorDetails += ` - ${JSON.stringify(errorData)}`
        } catch (e) {
          try {
            const errorText = await response.text()
            errorDetails += ` - ${errorText}`
          } catch (e2) {
            /* Ignore */
          }
        }
        throw new Error(errorDetails)
      }

      const data = await response.json()

      if (data && typeof data.answer === "string") {
        console.log("Received response data:", data)
        setChatHistory((prev) => [...prev, { text: data.answer, isUser: false }])
      } else {
        console.error("Invalid response format. 'answer' field missing or not a string:", data)
        setChatHistory((prev) => [
          ...prev,
          { text: "Sorry, received an invalid response from the server.", isUser: false },
        ])
      }
    } catch (error) {
      console.error("Failed to send message to /query/ API", error)
      setChatHistory((prev) => [
        ...prev,
        {
          text: `Sorry, I couldn't process your request. Error: ${error instanceof Error ? error.message : String(error)}`,
          isUser: false,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const regenerateLastResponse = async () => {
    // Find the last user message
    const lastUserMessageIndex = [...chatHistory].reverse().findIndex((msg) => msg.isUser)
    if (lastUserMessageIndex === -1) return

    const lastUserMessage = chatHistory[chatHistory.length - lastUserMessageIndex - 1]

    // Remove the last AI response if it exists
    if (!chatHistory[chatHistory.length - 1].isUser) {
      setChatHistory((prev) => prev.slice(0, prev.length - 1))
    }

    // Re-send the last user message
    try {
      setIsLoading(true)

      // Get user ID from localStorage
      const userId = localStorage.getItem("user_id") || "default_user"

      // Call our Next.js API route
      const response = await fetch("/api/llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          query: "message",
          message: lastUserMessage.text,
          // Include mind map paths as context if enabled
          context: useAsContext && searchPaths.length > 0 ? searchPaths.map((path) => path.join(" > ")) : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      // Parse the response
      const data = await response.text()

      // Add LLM response to chat history
      setChatHistory((prev) => [...prev, { text: data, isUser: false }])
    } catch (error) {
      console.error("Failed to regenerate response", error)
      setChatHistory((prev) => [
        ...prev,
        { text: "Sorry, I couldn't regenerate a response. Please try again.", isUser: false },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="flex flex-col h-[calc(100vh-64px)] bg-white text-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Chat Messages */}
      <motion.div className="flex-1 p-4 overflow-y-auto" variants={fadeIn("down", 0.2)} initial="hidden" animate="show">
        {chatHistory.map((msg, index) => (
          <motion.div
            key={index}
            className={`flex ${msg.isUser ? "justify-end" : "justify-start"} mb-4`}
            initial={{ opacity: 0, y: 20, x: msg.isUser ? 20 : -20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div
              className={`prose prose-sm max-w-none p-3 rounded-2xl ${
                msg.isUser
                  ? "bg-green-500 text-white rounded-tr-none prose-invert"
                  : "bg-gray-100 text-black rounded-tl-none"
              }`}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div className="flex justify-start mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-gray-100 text-black p-3 rounded-2xl rounded-tl-none max-w-[80%]">
              <div className="flex space-x-2">
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </motion.div>

      {/* Chat Input */}
      <motion.div className="border-t p-4 bg-white" variants={fadeIn("up", 0.3)} initial="hidden" animate="show">
        {/* Mind Map Paths Section */}
        <div className="mb-4">
          <div
            className="flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-gray-50"
            onClick={() => setShowSettings(!showSettings)}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-sm">Mind Map Paths</span>
              {searchPaths.length > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                  {searchPaths.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={useAsContext} onCheckedChange={setUseAsContext} className="mr-2" />
              <span className="text-xs text-gray-500 mr-2">Use as context</span>
              {showSettings ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </div>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2 px-2">
                  {/* Search input */}
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search path..."
                      className="pl-8 h-8 text-sm"
                      value={pathSearchQuery}
                      onChange={(e) => setPathSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Path list */}
                  {searchPaths.length > 0 ? (
                    <div>
                      <div className="max-h-40 overflow-y-auto mb-2 rounded-md border">
                        {filteredPaths.map((path, index) => (
                          <TooltipProvider key={index}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-between p-2 hover:bg-gray-50 border-b last:border-b-0">
                                  <div className="flex items-center gap-2">
                                    {useAsContext ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <div className="h-4 w-4 border border-gray-300 rounded-sm" />
                                    )}
                                    <span className="text-sm truncate max-w-[200px]">{getFinalNode(path)}</span>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <MoreVertical className="h-4 w-4 text-gray-500" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem className="flex items-center">
                                        <Eye className="mr-2 h-4 w-4" />
                                        <span>View full path</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="flex items-center">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        <span>Locate in MindMap</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="flex items-center text-red-500"
                                        onClick={() => {
                                          setSearchPaths((prev) => prev.filter((_, i) => i !== index))
                                        }}
                                      >
                                        <X className="mr-2 h-4 w-4" />
                                        <span>Remove path</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{getFullPathString(path)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>

                      {/* Clear all button */}
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs h-7"
                          onClick={handleClearSearchPaths}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Clear All
                        </Button>
                      </div>

                      {/* Latest added node notification */}
                      {latestSearchNode && (
                        <div className="text-xs text-gray-500 mt-1 italic">Added: "{latestSearchNode.topic}"</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500">No mind map paths selected.</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("typeMessage")}
            className="flex-1 bg-white text-black border-gray-300"
            disabled={isLoading}
          />
          <motion.div whileHover="hover" whileTap="tap" variants={buttonAnimation}>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
              <Send className="w-4 h-4 mr-2" />
              {t("send")}
            </Button>
          </motion.div>
          <motion.div whileHover="hover" whileTap="tap" variants={buttonAnimation}>
            <Button
              type="button"
              variant="outline"
              className="border-gray-300 text-black"
              onClick={regenerateLastResponse}
              disabled={isLoading || chatHistory.length === 0}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t("regenerate")}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  )
}
