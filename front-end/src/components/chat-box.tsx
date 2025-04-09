"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronUp, Send, RefreshCw, Settings, FileText, Sparkles, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/language-context"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import { fadeIn, buttonAnimation } from "@/lib/motion-utils"
import ReactMarkdown from 'react-markdown';

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

  const [searchPaths, setSearchPaths] = useState<string[][]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [latestSearchNode, setLatestSearchNode] = useState<{id: string, topic: string} | null>(null);

  useEffect(() => {
    // Handler for mind map search events
    const handleMindMapPathsUpdated = (event: any) => {
      const { paths, latestNode } = event.detail;
      
      // Update our local state with the paths
      setSearchPaths(paths);
      
      // Store the latest added node for feedback
      setLatestSearchNode(latestNode);
      
      // Show the dropdown
      setShowSearchDropdown(true);
    };
    
    // Add event listener
    window.addEventListener('mindmap_paths_updated', handleMindMapPathsUpdated);
    
    // Clean up function
    return () => {
      window.removeEventListener('mindmap_paths_updated', handleMindMapPathsUpdated);
    };
  }, []);

  // Add this function to handle selecting a search path
  const handleSelectSearchPath = (path: string[]) => {
    // Add the selected path to chat history
    const pathString = path.join(' → ');
    
    setChatHistory(prev => [
      ...prev, 
      { 
        text: `Search Mind Map Path: "${pathString}"`, 
        isUser: true 
      }
    ]);
    
    // Hide the dropdown after selection
    setShowSearchDropdown(false);
  };

  const handleClearSearchPaths = () => {
    setSearchPaths([]);
    setShowSearchDropdown(false);
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatHistory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = message.trim();
    if (!userMessage) return;

    setChatHistory((prev) => [...prev, { text: userMessage, isUser: true }]);
    setMessage("");
    setIsLoading(true);

    try {
      // --- THÊM BƯỚC NÀY ---
      // Lấy user_id từ localStorage (cung cấp giá trị mặc định nếu không tìm thấy)
      const currentUserId = localStorage.getItem("user_id") || "default_user";
      // --------------------

      const queryApiUrl = "http://localhost:8000/query/"; // Đảm bảo URL đúng

      // --- ĐIỀU CHỈNH REQUEST BODY ---
      const requestBody = {
        user_id: currentUserId, // Thêm user_id vào đây
        question: userMessage,
      };
      // -----------------------------

      console.log("Sending request to:", queryApiUrl);
      console.log("Request body:", JSON.stringify(requestBody)); // Log body đã cập nhật

      const response = await fetch(queryApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody), // Gửi body đã cập nhật
      });

      if (!response.ok) {
        // ... (phần xử lý lỗi giữ nguyên như cũ) ...
        let errorDetails = `API error: ${response.status}`;
        try {
            const errorData = await response.json();
            errorDetails += ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
            try {
               const errorText = await response.text();
               errorDetails += ` - ${errorText}`;
            } catch (e2) { /* Ignore */ }
        }
        throw new Error(errorDetails);
      }

      const data = await response.json();

      if (data && typeof data.answer === 'string') {
        console.log("Received response data:", data);
        setChatHistory((prev) => [...prev, { text: data.answer, isUser: false }]);
      } else {
        console.error("Invalid response format. 'answer' field missing or not a string:", data);
        setChatHistory((prev) => [
          ...prev,
          { text: "Sorry, received an invalid response from the server.", isUser: false },
        ]);
      }

    } catch (error) {
      console.error("Failed to send message to /query/ API", error);
      setChatHistory((prev) => [
        ...prev,
        { text: `Sorry, I couldn't process your request. Error: ${error instanceof Error ? error.message : String(error)}`, isUser: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Also update the regenerateLastResponse function:
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
            {/* ---- THAY ĐỔI BÊN TRONG DIV NÀY ---- */}
            <div
              // Thêm class 'prose' nếu bạn dùng Tailwind Typography plugin để có style cơ bản
              // Bạn cũng có thể cần 'prose-invert' cho nền tối (tin nhắn người dùng)
              // Nếu không dùng Tailwind Typography, bạn cần tự style các thẻ H1, p, ul,...
              className={`prose prose-sm max-w-none p-3 rounded-2xl ${
                msg.isUser
                  ? "bg-green-500 text-white rounded-tr-none prose-invert" // Thêm prose-invert cho nền tối
                  : "bg-gray-100 text-black rounded-tl-none"
              }`}
            >
              {/* Sử dụng ReactMarkdown để render nội dung */}
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
            {/* ---- KẾT THÚC THAY ĐỔI ---- */}
          </motion.div>
        ))}
        {isLoading && (
          <motion.div className="flex justify-start mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-gray-100 text-black p-3 rounded-2xl rounded-tl-none max-w-[80%]">
              {/* ... (phần loading indicator) */}
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
         {/* ... (phần settings và form input giữ nguyên như cũ) ... */}
        <div className="flex items-center justify-between mb-2">
        <motion.button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-4 h-4 mr-1" />
          {/* Change this line from t("chatSettings") to "MindMapPath" */}
          {"MindMapPath"}
          {showSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </motion.button>
        </div>

        <AnimatePresence>
            {showSettings && (
              <motion.div
                className="mb-4 p-4 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
        
                  
                  {/* Search Paths Dropdown */}
                  {searchPaths.length > 0 ? (
                    <div className="mt-2 relative">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setShowSearchDropdown(!showSearchDropdown)}
                          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                          <Search className="w-4 h-4 mr-1" />
                          Available Paths ({searchPaths.length})
                          <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${showSearchDropdown ? "rotate-180" : ""}`} />
                        </button>
                        
                        {latestSearchNode && (
                          <div className="text-xs text-gray-500">
                            Added path to "{latestSearchNode.topic}"
                          </div>
                        )}
                        
                        <button
                          onClick={handleClearSearchPaths}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Clear All
                        </button>
                      </div>
                      
                      {showSearchDropdown && (
                        <div className="absolute z-50 mt-1 w-full bg-white rounded-md border border-gray-300 shadow-lg max-h-60 overflow-y-auto">
                          <div className="p-2 text-xs font-medium text-gray-500 bg-gray-50">
                            Click a path to add it to your message
                          </div>
                          
                          {searchPaths.map((path, index) => (
                            <button
                              key={index}
                              className="flex items-center justify-between w-full p-2 text-sm hover:bg-green-50 border-t border-gray-100"
                              onClick={() => handleSelectSearchPath(path)}
                            >
                              <span className="truncate">
                                {path.join(' → ')}
                              </span>
                              <Search className="w-4 h-4 ml-2 flex-shrink-0 text-green-500" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No mind map paths selected. Click search icons in the mind map to add paths.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
            {/* ... Nội dung form ... */}
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
  );

} 

