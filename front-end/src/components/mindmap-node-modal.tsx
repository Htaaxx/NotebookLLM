"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { X, ChevronRight, Loader2, BookOpen, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Separator } from "@/components/ui/separator"

interface MindMapNodeModal {
  id: string
  topic: string
  level: number
  detailContent?: string
}

interface MindMapNodeModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  node?: MindMapNodeModal
  paths?: string[][]
  onUseAsContext?: (paths: string[][], useAsContext: boolean) => void
  containerRef?: React.RefObject<HTMLDivElement>
}

export function MindMapNodeModal({
  isOpen,
  onClose,
  title,
  content,
  node,
  paths = [],
  onUseAsContext,
  containerRef,
}: MindMapNodeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [isRecallLoading, setIsRecallLoading] = useState(false)
  const [isFlashcardLoading, setIsFlashcardLoading] = useState(false)
  const [recallPaths, setRecallPaths] = useState<string[][]>([])
  const [flashcardPaths, setFlashcardPaths] = useState<string[][]>([])
  const [showRecallPaths, setShowRecallPaths] = useState(false)
  const [showFlashcardPaths, setShowFlashcardPaths] = useState(false)
  const [recallSuccess, setRecallSuccess] = useState<boolean | null>(null)
  const [flashcardSuccess, setFlashcardSuccess] = useState<boolean | null>(null)
  const [apiCallInProgress, setApiCallInProgress] = useState(false)

  // Close modal when clicking outside
  useEffect(() => {
    console.log("Modal state changed:", isOpen)

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        console.log("Click outside modal detected")
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Close modal when pressing Escape
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen, onClose])

  // Function to find a node by its ID in the mind map structure
  const findNodeById = (rootNode: any, targetId: string): any => {
    if (!rootNode) return null

    // If we found the target node
    if (rootNode.id === targetId) {
      return rootNode
    }

    // Recursively search in children
    if (rootNode.children && rootNode.children.length > 0) {
      for (const child of rootNode.children) {
        const found = findNodeById(child, targetId)
        if (found) return found
      }
    }

    return null
  }

  // Function to find all paths from a node to its leaf nodes
  const findPathsToLeaves = (startNode: any): string[][] => {
    const paths: string[][] = []

    // Helper function to traverse recursively
    const traverse = (node: any, currentPath: string[] = []) => {
      // Add current node to path
      const path = [...currentPath, node.topic]

      // If node has no children, it's a leaf node - add the path
      if (!node.children || node.children.length === 0) {
        paths.push(path)
        return
      }

      // Otherwise, continue traversing for each child
      for (const child of node.children) {
        traverse(child, path)
      }
    }

    // Start traversal from the given node
    traverse(startNode, [])
    return paths
  }

  // Call API to generate questions based on the selected node and its paths
  const callQuestionGenerationAPI = async (nodePaths: string[][]) => {
    try {
      setApiCallInProgress(true)
  
      // Get user ID from localStorage
      const userId = localStorage.getItem("user_id") || "default_user"
  
      // Prepare the request body for starting a recall session
      const requestBody = {
        user_id: userId,
        topic: node?.topic || title,
      }
  
      console.log("Starting recall session with:", requestBody)
  
      // Call the ACTUAL backend API endpoint
      const url = process.env.NEXT_PUBLIC_BACKEND_DB_URL + "/api/recall/start"
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
  
      const data = await response.json()
      console.log("Recall session started successfully:", data)
  
      // Store session_id in localStorage for later use
      localStorage.setItem("recall_session_id", data.session_id);
      
      // Instead of alert, add to chat history
      addToChat(data.first_question);
      
      // Close modal after question is sent to chat
      onClose();
  
      return true
    } catch (error) {
      console.error("Error starting recall session:", error)
      return false
    } finally {
      setApiCallInProgress(false)
    }
  }
  
  // Add this function to send the question to chat
  const addToChat = (question: string) => {
    // Dispatch a custom event that the chat component can listen for
    const event = new CustomEvent("recall_question", {
      detail: {
        question: question,
        sessionId: localStorage.getItem("recall_session_id"),
        context: `${node?.topic || title}`
      }
    });
    window.dispatchEvent(event);
  }

  // Call API to generate flashcards based on the selected node and its paths
  const callFlashcardGenerationAPI = async (nodePaths: string[][]) => {
    try {
      setApiCallInProgress(true)
  
      // Get user ID from localStorage
      const userId = localStorage.getItem("user_id") || "default_user"
  
      // Format the node paths into the structure expected by the backend
      const nodes = nodePaths.map((path, index) => ({
        header: path[0], // The first node in the path (selected node)
        details: path.join(" > "), // Full path as details
      }));
  
      // Prepare the request body
      const requestBody = {
        user_id: userId,
        deck_id: `mind_map_${Date.now()}`, // Generate a temporary deck ID
        nodes: nodes,
        numQuestions: 5 // Number of flashcards to generate
      }
  
      console.log("Starting flashcard generation with:", requestBody)
       
      // Call the proper flashcard generation endpoint
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_DB_URL+"/api/flashcards/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
  
      const data = await response.json()
      console.log("Flashcard generation successful:", data)
  
      // Store flashcard data in localStorage
      localStorage.setItem("last_generated_deck", JSON.stringify({
        id: data.deck_id,
        name: `From Mind Map: ${node?.topic || title}`,
        description: "Generated from mind map",
        cards: data.cards,
        timestamp: Date.now()
      }));
  
      return true
    } catch (error) {
      console.error("Error generating flashcards:", error)
      return false
    } finally {
      setApiCallInProgress(false)
    }
  }

  // Generate questions from the selected node
  const handleMakeQuestion = async () => {
    setIsRecallLoading(true)
    setShowRecallPaths(true)

    try {
      // Get the mind map instance
      if (!containerRef?.current || !containerRef.current._mindElixirInstance) {
        throw new Error("Mind map instance not found")
      }

      // Get the root node data from the mind map
      const mindElixirInstance = containerRef.current._mindElixirInstance
      const rootNode = mindElixirInstance.nodeData

      // Find the selected node in the mind map data structure
      const selectedNodeInMap = node ? findNodeById(rootNode, node.id) : null

      if (!selectedNodeInMap) {
        throw new Error("Selected node not found in mind map")
      }

      // Get all paths from the selected node to its leaf nodes
      // This will only include the selected node and its descendants
      const pathsToLeaves = findPathsToLeaves(selectedNodeInMap)

      // Set the paths - these start from the selected node, not from root
      setRecallPaths(pathsToLeaves)

      // Call the API to generate questions
      const apiSuccess = await callQuestionGenerationAPI(pathsToLeaves)

      setRecallSuccess(true)
    } catch (error) {
      console.error("Error finding paths to leaves:", error)
      setRecallSuccess(false)
    } finally {
      setIsRecallLoading(false)
    }
  }

  // Generate flashcards from the selected node
  const handleCreateFlashcard = async () => {
    setIsFlashcardLoading(true)
    setShowFlashcardPaths(true)

    try {
      // Get the mind map instance
      if (!containerRef?.current || !containerRef.current._mindElixirInstance) {
        throw new Error("Mind map instance not found")
      }

      // Get the root node data from the mind map
      const mindElixirInstance = containerRef.current._mindElixirInstance
      const rootNode = mindElixirInstance.nodeData

      // Find the selected node in the mind map data structure
      const selectedNodeInMap = node ? findNodeById(rootNode, node.id) : null

      if (!selectedNodeInMap) {
        throw new Error("Selected node not found in mind map")
      }

      // Get paths from the selected node to its leaf nodes
      const pathsToLeaves = findPathsToLeaves(selectedNodeInMap)

      // Set the paths - these start from the selected node, not from root
      setFlashcardPaths(pathsToLeaves)

      // Call the API to generate flashcards
      const apiSuccess = await callFlashcardGenerationAPI(pathsToLeaves)

      setFlashcardSuccess(true)
    } catch (error) {
      console.error("Error creating flashcards:", error)
      setFlashcardSuccess(false)
    } finally {
      setIsFlashcardLoading(false)
    }
  }

  // Parse the content to render it properly
  const renderContent = () => {
    if (!content) return null

    // Split content into lines
    const lines = content.split("\n").filter((line) => line.trim() !== "")

    return (
      <div className="space-y-4">
        {lines.map((line, index) => {
          // Check if line is a bullet point
          if (line.trim().startsWith("-")) {
            const bulletContent = line.trim().substring(1).trim()
            return (
              <div key={index} className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-green-600"></span>
                <p className="text-gray-700">{bulletContent}</p>
              </div>
            )
          }

          // Check if line is a sub-heading (starts with multiple #)
          if (line.trim().startsWith("##")) {
            const level = line.trim().split(" ")[0].length
            const headingContent = line.trim().substring(level).trim()

            if (level === 2) {
              return (
                <h2 key={index} className="text-xl font-semibold mt-6 mb-2">
                  {headingContent}
                </h2>
              )
            } else if (level === 3) {
              return (
                <h3 key={index} className="text-lg font-medium mt-4 mb-2">
                  {headingContent}
                </h3>
              )
            } else {
              return (
                <h4 key={index} className="text-base font-medium mt-3 mb-1">
                  {headingContent}
                </h4>
              )
            }
          }

          // Regular paragraph
          return (
            <p key={index} className="text-gray-700">
              {line}
            </p>
          )
        })}
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            className="z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <Card className="border-0 shadow-xl bg-[#F2F5DA]">
              <CardHeader className="bg-green-600 text-white py-4 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-xl">{title}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-green-700"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>

              <CardContent className="p-6 max-h-[calc(90vh-160px)] overflow-y-auto">
                {/* Node Detail Content */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                      Node Detail
                    </span>
                  </h3>
                  {renderContent()}
                </div>

                <Separator className="my-4" />

                {/* Recall Service */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium flex items-center">
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                        Recall Service
                      </span>
                    </h3>
                    <Button
                      onClick={handleMakeQuestion}
                      disabled={isRecallLoading || apiCallInProgress}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isRecallLoading || (apiCallInProgress && !flashcardSuccess) ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <HelpCircle className="h-4 w-4 mr-2" />
                          Make Question
                        </>
                      )}
                    </Button>
                  </div>

                  {showRecallPaths && (
                    <div className="mt-3">
                      {recallSuccess === false && (
                        <div className="bg-red-100 text-red-800 p-3 rounded-md mb-3">
                          Failed to retrieve paths. Please try again.
                        </div>
                      )}

                      {recallSuccess === true && (
                        <>
                          <div className="bg-green-100 text-green-800 p-3 rounded-md mb-3">
                            Successfully retrieved paths for question generation.
                          </div>
                          <div className="space-y-2 mt-2">
                            {recallPaths.map((path, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-md">
                                <div className="flex items-center">
                                  <div className="flex items-center flex-wrap">
                                    {path.map((node, nodeIndex) => (
                                      <span key={nodeIndex} className="flex items-center">
                                        <span className="text-gray-700">{node}</span>
                                        {nodeIndex < path.length - 1 && (
                                          <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                                        )}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Create Flashcard */}
                <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium flex items-center">
                    <span className="bg-[#F2F5DA] text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                      Create Flashcard
                    </span>
                  </h3>
                  <Button
                    onClick={handleCreateFlashcard}
                    disabled={isFlashcardLoading || apiCallInProgress}
                    className="bg-[#E48D44] hover:bg-[#518650]"
                  >
                    {isFlashcardLoading || (apiCallInProgress && flashcardSuccess) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Create Flashcard
                      </>
                    )}
                  </Button>
                </div>

                  {showFlashcardPaths && (
                    <div className="mt-3">
                      {flashcardSuccess === false && (
                        <div className="bg-red-100 text-red-800 p-3 rounded-md mb-3">
                          Failed to create flashcards. Please try again.
                        </div>
                      )}

                      {flashcardSuccess === true && (
                        <>
                          <div className="bg-green-100 text-green-800 p-3 rounded-md mb-3">
                            Successfully prepared content for flashcard creation.
                          </div>
                          <div className="space-y-2 mt-2">
                            {flashcardPaths.map((path, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-md">
                                <div className="flex items-center">
                                  <div className="flex items-center flex-wrap">
                                    {path.map((node, nodeIndex) => (
                                      <span key={nodeIndex} className="flex items-center">
                                        <span className="text-gray-700">{node}</span>
                                        {nodeIndex < path.length - 1 && (
                                          <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                                        )}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button 
                              variant="outline" 
                              className="mr-2"
                              onClick={onClose}
                            >
                              Close
                            </Button>
                            <Button 
                              className="bg-[#E48D44] hover:bg-[#518650] text-white"
                              onClick={() => {
                                // Store the current deck ID for easy access
                                const deckData = JSON.parse(localStorage.getItem("last_generated_deck") || "{}");
                                localStorage.setItem("active_flashcard_deck", deckData.id);
                                
                                // Navigate to flashcard page
                                window.location.href = "/flashcard";
                              }}
                            >
                              View Flashcards
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="bg-gray-50 py-3 px-6 flex justify-end">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
