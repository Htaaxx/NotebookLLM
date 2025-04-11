"use client"

import { useEffect, useRef, useState } from "react"
import { X, ChevronRight, Loader2, BookOpen, Search, HelpCircle } from "lucide-react"
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

// Update the interface to include the onUseAsContext prop
interface MindMapNodeModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  node?: MindMapNodeModal
  paths?: string[][]
  onUseAsContext?: (paths: string[][], useAsContext: boolean) => void
}

export function MindMapNodeModal({
  isOpen,
  onClose,
  title,
  content,
  node,
  paths = [],
  onUseAsContext,
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

  // Add paths to chat context
  const handleAddToChat = () => {
    if (paths.length > 0) {
      // Dispatch event to send paths to chat component
      const searchEvent = new CustomEvent("mindmap_paths_updated", {
        detail: {
          paths: paths,
          latestNode: node,
        },
      })
      window.dispatchEvent(searchEvent)
      console.log("Added paths to chat:", paths)
    }
  }

  // Simulate fetching recall paths (node to leaf nodes)
  const handleMakeQuestion = async () => {
    setIsRecallLoading(true)
    setShowRecallPaths(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock data - in a real implementation, this would come from an API
      const mockPaths = [
        ["Mind Map", "Topic 1", "Subtopic 1.1", "Detail point"],
        ["Mind Map", "Topic 1", "Subtopic 1.2", "Another detail"],
        ["Mind Map", "Topic 2", "Subtopic 2.1", "More information"],
      ]

      setRecallPaths(mockPaths)
      setRecallSuccess(true)
    } catch (error) {
      console.error("Error fetching recall paths:", error)
      setRecallSuccess(false)
    } finally {
      setIsRecallLoading(false)
    }
  }

  // Simulate creating flashcards
  const handleCreateFlashcard = async () => {
    setIsFlashcardLoading(true)
    setShowFlashcardPaths(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock data - in a real implementation, this would come from an API
      const mockPaths = [
        ["Mind Map", "Topic 1", "Subtopic 1.1", "Detail point"],
        ["Mind Map", "Topic 3", "Subtopic 3.2", "Important concept"],
      ]

      setFlashcardPaths(mockPaths)
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
            <Card className="border-0 shadow-xl">
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
                      disabled={isRecallLoading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isRecallLoading ? (
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
                      <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                        Create Flashcard
                      </span>
                    </h3>
                    <Button
                      onClick={handleCreateFlashcard}
                      disabled={isFlashcardLoading}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {isFlashcardLoading ? (
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
                            <Button className="bg-amber-600 hover:bg-amber-700">Confirm Flashcard Creation</Button>
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
