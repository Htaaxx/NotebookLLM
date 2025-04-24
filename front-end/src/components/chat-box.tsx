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
  Check,
  Map,
  Globe,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/language-context"
import { motion } from "framer-motion"
import { fadeIn, buttonAnimation } from "@/lib/motion-utils"
import ReactMarkdown from "react-markdown"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { accountTypeAPI } from "@/lib/api";
import { ACCOUNT_LIMITS, shouldResetDailyCounts } from "@/lib/account-limits";

interface ChatBoxProps {
  isDisabled?: boolean
}

export function ChatBox({ isDisabled = false }: ChatBoxProps) {
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<Array<{ text: string; isUser: boolean }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()

  const chatEndRef = useRef<HTMLDivElement | null>(null)

  const [searchPaths, setSearchPaths] = useState<string[][]>([])
  const [pathSearchQuery, setPathSearchQuery] = useState("")
  const [latestSearchNode, setLatestSearchNode] = useState<{ id: string; topic: string } | null>(null)
  const [useAsContext, setUseAsContext] = useState(false)
  const [expandedPaths, setExpandedPaths] = useState(false)
  const [activeRecallSession, setActiveRecallSession] = useState<string | null>(null)

  // New state for the context collapsible
  const [isContextOpen, setIsContextOpen] = useState(false)

  // URL context state
  const [url, setUrl] = useState("")
  const [urlSearchQuery, setUrlSearchQuery] = useState("")
  const [urls, setUrls] = useState<string[]>([])
  const [useUrlContext, setUseUrlContext] = useState(false)

  // account type
  const [accountType, setAccountType] = useState<string>("FREE");
  const [queryCount, setQueryCount] = useState<number>(0);
  const [limitExceeded, setLimitExceeded] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  // URL context functions
  const handleAddUrl = () => {
    if (url && !urls.includes(url)) {
      setUrls([...urls, url])
      setUrl("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddUrl()
    }
  }

  const isYoutubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be")
  }

  const handleClearUrls = () => {
    setUrls([])
  }

  // Filter URLs based on search query
  const filteredUrls = urls.filter((url) => {
    if (!urlSearchQuery) return true
    return url.toLowerCase().includes(urlSearchQuery.toLowerCase())
  })

  // Check account type and usage counts on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedUserId = localStorage.getItem('user_id');
        if (!storedUserId) return;
        setUserId(storedUserId);
        // Check if we need to reset daily counts
        if (shouldResetDailyCounts()) {
          console.log("Resetting daily counts");
          // You would implement server-side reset here
          // For now, we'll just update our local state
          setQueryCount(0);
        }
        // Fetch account type
        const accountTypeData = await accountTypeAPI.getAccountTypes(storedUserId);
        setAccountType(accountTypeData.accountType || "FREE");
        // Fetch query count
        const countData = await accountTypeAPI.getCountQuery(storedUserId);
        setQueryCount(countData.countQuery || 0);
        // Check if limit exceeded
        checkQueryLimit(accountTypeData.accountType || "FREE", countData.countQuery || 0);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUserInfo();
  }, []);

  // Add this function to check if user has exceeded their daily limit
  const checkQueryLimit = (type: string, count: number) => {
    const limit = 
      type === "PRO" ? ACCOUNT_LIMITS.PRO.CHAT_QUERIES :
      type === "STANDARD" ? ACCOUNT_LIMITS.STANDARD.CHAT_QUERIES :
      ACCOUNT_LIMITS.FREE.CHAT_QUERIES;
    setLimitExceeded(count >= limit);
  }
  // Add word count check
  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).length;
  };

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

      // Open the context panel when new paths are added
      setIsContextOpen(true)
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
    if (!userMessage || isLoading || isDisabled || limitExceeded) return;

    // Check word count limit for non-PRO users
    if (accountType !== "PRO") {
      const wordCount = countWords(userMessage);
      const wordLimit = accountType === "STANDARD" ? 
                        ACCOUNT_LIMITS.STANDARD.MAX_QUERY_WORDS : 
                        ACCOUNT_LIMITS.FREE.MAX_QUERY_WORDS;
      if (wordCount > wordLimit) {
        setChatHistory(prev => [
          ...prev, 
          { 
            text: `Your message exceeds the ${wordLimit} word limit for ${accountType} accounts. Please shorten your message.`, 
            isUser: false 
          }
        ]);
        return;
      }
    }

    // Add user message to chat history
    setChatHistory((prev) => [...prev, { text: userMessage, isUser: true }])
    setMessage("")
    setIsLoading(true)

    try {
      // Check if we're in a recall session
      if (activeRecallSession) {
        console.log(`Processing answer for recall session: ${activeRecallSession}`)

        // Send answer to recall API
        const response = await fetch("http://localhost:8000/recall/answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: activeRecallSession,
            user_answer: userMessage,
          }),
        })

        if (!response.ok) {
          let errorDetails = `Recall API error: ${response.status}`
          try {
            const errorData = await response.json()
            errorDetails += ` - ${JSON.stringify(errorData)}`
          } catch (e) {
            /* Ignore parsing errors */
          }
          throw new Error(errorDetails)
        }

        const data = await response.json()

        // Add feedback to chat as a chatbox reply
        setChatHistory((prev) => [
          ...prev,
          {
            text: data.feedback || "Thank you for your answer.",
            isUser: false,
          },
        ])

        // If there's a next question, add it as another chatbox reply
        if (data.next_question) {
          setChatHistory((prev) => [
            ...prev,
            {
              text: data.next_question,
              isUser: false,
            },
          ])
        } else {
          // End of session
          setChatHistory((prev) => [
            ...prev,
            {
              text: "Recall session completed. Thank you for your answers!",
              isUser: false,
            },
          ])
          setActiveRecallSession(null)
        }
      } else {
        // Regular chat message handling (existing code)
        const currentUserId = localStorage.getItem("user_id") || "default_user"
        const queryApiUrl = "http://localhost:8000/query/"

        // Prepare request body
        const requestBody = {
          user_id: currentUserId,
          question: userMessage,
          headers: searchPaths.map((path) => path.join(" > ")),
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
      }

      // After successful processing, update the count
      if (userId) {
        const newCount = queryCount + 1;
        await accountTypeAPI.updateCountQuery(userId);
        setQueryCount(newCount);
        // Check if this query puts user over the limit
        checkQueryLimit(accountType, newCount);
      }
    } catch (error) {
      console.error("Failed to process message:", error)
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

  useEffect(() => {
    // Handler for recall questions
    const handleRecallQuestion = (event: any) => {
      const { question, sessionId, context } = event.detail

      // Add a system message indicating this is a recall session
      setChatHistory((prev) => [
        ...prev,
        {
          text: `Starting recall session for: ${context}`,
          isUser: false,
          isSystem: true,
        },
      ])

      // Add the question from LLM
      setChatHistory((prev) => [
        ...prev,
        {
          text: question,
          isUser: false,
          isRecallQuestion: true, // Add a flag to style differently if desired
          sessionId: sessionId, // Store the session ID with the message
        },
      ])

      // Store the current active session ID for handling answers
      setActiveRecallSession(sessionId)
    }

    // Add event listener
    window.addEventListener("recall_question", handleRecallQuestion)

    // Clean up
    return () => {
      window.removeEventListener("recall_question", handleRecallQuestion)
    }
  }, [])

  const renderMindMapPaths = () => (
    <div className="px-2 py-1">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-green-600" />
          <span className="font-medium text-sm">Mind Map Paths</span>
          {searchPaths.length > 0 && (
            <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
              {searchPaths.length}
            </Badge>
          )}
        </div>
        <Switch checked={useAsContext} onCheckedChange={setUseAsContext} className="scale-75" />
      </div>

      {/* Search input */}
      {searchPaths.length > 0 && (
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <Input
            placeholder="Search path..."
            className="pl-7 h-7 text-xs"
            value={pathSearchQuery}
            onChange={(e) => setPathSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Path list */}
      {searchPaths.length > 0 ? (
        <div>
          <div className="max-h-32 overflow-y-auto mb-2 rounded-md border">
            {filteredPaths.map((path, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between p-1.5 hover:bg-gray-50 border-b last:border-b-0">
                      <div className="flex items-center gap-1">
                        {useAsContext ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <div className="h-3 w-3 border border-gray-300 rounded-sm" />
                        )}
                        <span className="text-xs truncate max-w-[200px]">{getFinalNode(path)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={() => {
                          setSearchPaths((prev) => prev.filter((_, i) => i !== index))
                        }}
                      >
                        <X className="h-3 w-3 text-gray-500" />
                      </Button>
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
              className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs h-6"
              onClick={handleClearSearchPaths}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-2 text-xs text-gray-500">No mind map paths selected.</div>
      )}
    </div>
  )

  // Render the URL Context section
  const renderUrlContext = () => (
    <div className="px-2 py-1">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-sm">URL Context</span>
          {urls.length > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
              {urls.length}
            </Badge>
          )}
        </div>
        <Switch checked={useUrlContext} onCheckedChange={setUseUrlContext} className="scale-75" />
      </div>

      {/* URL input */}
      <div className="relative mb-2">
        <Input
          placeholder="Add URL..."
          className="h-7 text-xs"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Search input */}
      {urls.length > 0 && (
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <Input
            placeholder="Search URLs..."
            className="pl-7 h-7 text-xs"
            value={urlSearchQuery}
            onChange={(e) => setUrlSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* URL list */}
      {urls.length > 0 ? (
        <div>
          <div className="max-h-32 overflow-y-auto mb-2 rounded-md border">
            {filteredUrls.map((url, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between p-1.5 hover:bg-gray-50 border-b last:border-b-0">
                      <div className="flex items-center gap-1">
                        {useUrlContext ? (
                          <Check className="h-3 w-3 text-blue-500" />
                        ) : (
                          <div className="h-3 w-3 border border-gray-300 rounded-sm" />
                        )}
                        {isYoutubeUrl(url) ? (
                          <div className="text-red-500 text-xs">YT</div>
                        ) : (
                          <Globe className="h-3 w-3 text-blue-500" />
                        )}
                        <span className="text-xs truncate max-w-[200px]">{url}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={() => {
                          setUrls((prev) => prev.filter((_, i) => i !== index))
                        }}
                      >
                        <X className="h-3 w-3 text-gray-500" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{url}</p>
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
              className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs h-6"
              onClick={handleClearUrls}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-2 text-xs text-gray-500">No URLs added.</div>
      )}
    </div>
  )

  return (
    <motion.div
      className="flex flex-col h-[calc(100vh-64px)] bg-white text-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Daily limit warning - show when user is approaching limit */}
      {accountType !== "PRO" && (
        <>
          {/* Threshold notifications (10, 20, 30, 40, 50) */}
          {!limitExceeded &&
            [10, 20, 30, 40, ACCOUNT_LIMITS[accountType === "STANDARD" ? "STANDARD" : "FREE"].CHAT_QUERIES].includes(
              queryCount,
            ) && (
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-md p-3 mb-2 mx-4 mt-2 border border-amber-200">
                <p className="text-amber-800 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                  You've used {queryCount}/
                  {accountType === "STANDARD" ? ACCOUNT_LIMITS.STANDARD.CHAT_QUERIES : ACCOUNT_LIMITS.FREE.CHAT_QUERIES}{" "}
                  daily queries.
                </p>
              </div>
            )}

          {/* Limit exceeded notification */}
          {limitExceeded && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-md p-3 mb-2 mx-4 mt-2 border border-red-200">
              <p className="text-red-800 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                You are out of messages until 00:00 of the next day.
              </p>
              <p className="text-red-800 text-sm mt-1 ml-6">
                Please upgrade your{" "}
                <span
                  className="text-blue-600 underline cursor-pointer hover:text-blue-800"
                  onClick={() => (window.location.href = "/pricing")}
                >
                  plan
                </span>{" "}
                to get more messages.
              </p>
            </div>
          )}
        </>
      )}

      {/* Embedding Status Message - Show when embedding is in progress */}
      {isDisabled && (
        <div className="bg-amber-50 rounded-md p-2 mb-2 mx-4 mt-2 text-sm">
          <p className="text-gray-700 text-xs flex items-center">
            <AlertCircle className="w-3 h-3 mr-1 text-amber-500" />
            Document processing in progress. Chat will be available soon.
          </p>
        </div>
      )}

      {/* Recall Mode Toggle - Simplified */}
      <div className="px-3 py-1.5 flex justify-end items-center">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-green-600">Recall mode</span>
          <Switch
            checked={!!activeRecallSession}
            onCheckedChange={(checked) => {
              if (!checked && activeRecallSession) {
                setActiveRecallSession(null)
                setChatHistory((prev) => [
                  ...prev,
                  {
                    text: "Recall session ended. Returning to normal chat mode.",
                    isUser: false,
                    isSystem: true,
                  },
                ])
              }
            }}
            className={`${activeRecallSession ? "bg-green-600" : "bg-gray-300"} scale-75`}
          />
        </div>
      </div>

      {/* Chat Messages - Reduced font size */}
      <motion.div className="flex-1 p-4 overflow-y-auto" variants={fadeIn("down", 0.2)} initial="hidden" animate="show">
        {chatHistory.map((msg, index) => (
          <motion.div
            key={index}
            className={`flex ${msg.isUser ? "justify-end" : "justify-start"} mb-3`}
            initial={{ opacity: 0, y: 20, x: msg.isUser ? 20 : -20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div
              className={`prose prose-xs max-w-none p-2.5 rounded-2xl ${
                msg.isUser
                  ? "bg-green-500 text-white rounded-tr-none prose-invert"
                  : "bg-gray-100 text-black rounded-tl-none"
              }`}
            >
              <div className="text-xs">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div className="flex justify-start mb-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-gray-100 text-black p-2.5 rounded-2xl rounded-tl-none max-w-[80%]">
              <div className="flex space-x-2">
                <div
                  className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </motion.div>

      {/* Chat Input with Context Collapsible */}
      <motion.div className="border-t bg-white" variants={fadeIn("up", 0.3)} initial="hidden" animate="show">
        {/* Combined Context Collapsible */}
        <Collapsible
          open={isContextOpen}
          onOpenChange={setIsContextOpen}
          className="mx-4 mt-2 border rounded-md overflow-hidden"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-sm">Context</span>
              {(searchPaths.length > 0 || urls.length > 0) && (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 text-xs">
                  {searchPaths.length + urls.length}
                </Badge>
              )}
            </div>
            <div>
              {isContextOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t">{renderMindMapPaths()}</div>
            <div className="border-t">{renderUrlContext()}</div>
          </CollapsibleContent>
        </Collapsible>

        {/* Message input form */}
        <form onSubmit={handleSubmit} className="flex gap-2 p-4">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("typeMessage")}
            className="flex-1 bg-white text-black border-gray-300 text-sm"
            disabled={isLoading || isDisabled || limitExceeded}
          />
          <motion.div whileHover="hover" whileTap="tap" variants={buttonAnimation}>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-sm" 
            disabled={isLoading || isDisabled || limitExceeded}>
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {t("send")}
            </Button>
          </motion.div>
          <motion.div whileHover="hover" whileTap="tap" variants={buttonAnimation}>
            <Button
              type="button"
              variant="outline"
              className="border-gray-300 text-black text-sm"
              onClick={regenerateLastResponse}
              disabled={isLoading || chatHistory.length === 0}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              {t("regenerate")}
            </Button>
          </motion.div>
        </form>

        {/* Disclaimer in footer */}
        <div className="px-4 pb-2 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <AlertCircle className="w-3 h-3 mr-1 text-gray-400" />
            NoteUS có thể đưa ra thông tin không chính xác, hãy kiểm tra câu trả lời mà bạn nhận được
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
