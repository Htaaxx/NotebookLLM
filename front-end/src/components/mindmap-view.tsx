"use client"

import { useEffect, useRef, useState } from "react"
import MindElixir from "mind-elixir"

const DEFAULT_MARKDOWN = `# Machine Learning Concepts

## Supervised Learning
### Classification
#### Decision Trees
#### Support Vector Machines
#### Neural Networks
### Regression
#### Linear Regression
#### Polynomial Regression

## Unsupervised Learning
### Clustering
#### K-Means
#### Hierarchical Clustering
### Dimensionality Reduction
#### PCA
#### t-SNE

## Reinforcement Learning
### Q-Learning
### Deep Q Networks

## Deep Learning
### Neural Networks
#### Feed Forward Networks
#### Convolutional Neural Networks
#### Recurrent Neural Networks
### Training Techniques
#### Backpropagation
#### Gradient Descent
#### Regularization
`

// ----------------------------------------------------------------
// TYPE DEFINITIONS
// ----------------------------------------------------------------

declare global {
  interface HTMLDivElement {
    _mindElixirInstance?: MindElixirInstance
  }
}

interface MindElixirInstance {
  init: (data?: any) => void
  destroy?: () => void
}

interface MindMapViewProps {
  markdownContent?: string
  markdownFilePath?: string
  className?: string
  selectedFiles?: any[]
}

type TopicNode = {
  topic: string
  id: string
  children?: TopicNode[]
}

interface MindElixirData {
  nodeData: {
    id: string
    topic: string
    children?: any[]
    [key: string]: any
  }
  linkData?: any
}

// ----------------------------------------------------------------
// COMPONENT IMPLEMENTATION
// ----------------------------------------------------------------

export function MindMapView({ markdownContent, markdownFilePath, className, selectedFiles }: MindMapViewProps) {
  // State and refs
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadedContent, setLoadedContent] = useState<string>(markdownContent || "")
  const [markdown, setMarkdown] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mindElixirLoaded, setMindElixirLoaded] = useState(false)

  // Fetch mindmap data from API based on selected files
  const fetchMindMapFromAPI = async (selectedFiles: any[]) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      console.log("No files selected for mindmap generation")
      return DEFAULT_MARKDOWN
    }

    setIsLoading(true)
    setError(null)

    try {
      const documentIds = selectedFiles.map((file) => file.id)

      const response = await fetch("/api/drawMindMap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: (documentIds).length > 0 ? JSON.stringify({ document_ids: documentIds }) : JSON.stringify({ document_ids: [] }),
      })

      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`)
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.text()
      console.log("Received mindmap data:", data.substring(0, 100) + "...")

      if (!data || data.trim() === "") {
        console.warn("Empty markdown received from API, using default")
        return DEFAULT_MARKDOWN
      }

      return data
    } catch (error) {
      console.error("Error fetching mindmap from API:", error)
      setError(`Failed to fetch mindmap: ${error instanceof Error ? error.message : String(error)}`)
      return DEFAULT_MARKDOWN
    } finally {
      setIsLoading(false)
    }
  }

  // get file markdown from public folder
  const getMarkdownFromPublic = (fileName: string) => {
    // Construct the path to the file in the public directory
    const publicPath = `/mindmaps/${fileName}`
    console.log("Loading markdown from public path:", publicPath)

    return fetch(publicPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load markdown file: ${response.status}`)
        }
        return response.text()
      })
      .then((content) => {
        if (!content || content.trim() === "") {
          console.warn("Empty markdown file loaded, using default")
          return DEFAULT_MARKDOWN
        }
        return content
      })
      .catch((error) => {
        console.error("Error loading markdown from public folder:", error)
        throw error
      })
  }

  // Load markdown content from API when selected files change
  useEffect(() => {
    if (selectedFiles && selectedFiles.length > 0) {
      fetchMindMapFromAPI(selectedFiles)
        .then((content) => {
          setMarkdown(content)
          setLoadedContent(content)
        })
        .catch((err) => {
          console.error("Error fetching mindmap:", err)
          setError(`Failed to fetch mindmap: ${err instanceof Error ? err.message : String(err)}`)
          setMarkdown(DEFAULT_MARKDOWN)
          setLoadedContent(DEFAULT_MARKDOWN)
        })
    } else if (markdownFilePath) {
      // If no selected files but a file path is provided, load from public folder
      getMarkdownFromPublic(markdownFilePath)
        .then((content) => {
          setMarkdown(content)
          setLoadedContent(content)
        })
        .catch((err) => {
          console.error("Error loading markdown from file:", err)
          setError(`Failed to load markdown file: ${err instanceof Error ? err.message : String(err)}`)
          setMarkdown(DEFAULT_MARKDOWN)
          setLoadedContent(DEFAULT_MARKDOWN)
        })
    } else if (markdownContent) {
      // If direct markdown content is provided
      setMarkdown(markdownContent)
      setLoadedContent(markdownContent)
    } else {
      // Default case
      setMarkdown(DEFAULT_MARKDOWN)
      setLoadedContent(DEFAULT_MARKDOWN)
    }
  }, [markdownContent, markdownFilePath, selectedFiles])

  // Generate unique ID for mind map nodes
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2)

  // Convert markdown content to MindElixir data structure
  const parseMarkdownToMindMap = (markdown: string): MindElixirData => {
    if (!markdown || markdown.trim() === "") {
      markdown = DEFAULT_MARKDOWN
    }

    try {
      const lines = markdown.split("\n")
      const rootTopic = lines.find((line) => line.trim().startsWith("# "))?.replace("# ", "") || "Mind Map"
      const rootNode: TopicNode = { id: "root", topic: rootTopic, children: [] }

      let currentLevel = 0
      const currentParentStack: TopicNode[] = [rootNode]

      lines.forEach((line) => {
        const trimmedLine = line.trim()
        if (!trimmedLine || trimmedLine.startsWith("# ")) return
        const match = trimmedLine.match(/^(#{2,6})\s+(.+)$/)
        if (match) {
          const level = match[1].length - 1
          const topic = match[2]

          // Adjust the parent stack based on the heading level
          while (currentLevel >= level && currentParentStack.length > 1) {
            currentParentStack.pop()
            currentLevel--
          }

          const newNode: TopicNode = { id: generateId(), topic, children: [] }
          const currentParent = currentParentStack[currentParentStack.length - 1]

          if (!currentParent.children) {
            currentParent.children = []
          }

          currentParent.children.push(newNode)
          currentParentStack.push(newNode)
          currentLevel = level
        }
      })

      console.log("Parsed mind map structure:", JSON.stringify(rootNode, null, 2).substring(0, 200) + "...")
      return { nodeData: rootNode as any }
    } catch (err) {
      console.error("Error parsing markdown:", err)
      setError("Failed to parse markdown content")
      return { nodeData: { id: "error", topic: "Error", children: [] } }
    }
  }

  // Initialize MindElixir when content changes
  useEffect(() => {
    // Skip if prerequisites aren't met
    if (!containerRef.current) return
    const container = containerRef.current

    // Use the loaded content or default
    const contentToUse = loadedContent || DEFAULT_MARKDOWN
    console.log("Initializing mind map with content length:", contentToUse.length)

    // Ensure MindElixir is loaded
    if (!mindElixirLoaded) {
      // This is a workaround for SSR/hydration issues
      setMindElixirLoaded(true)
      return
    }

    try {
      // Clean up any existing instance
      if (container._mindElixirInstance) {
        try {
          if (container._mindElixirInstance.destroy) {
            const instance = container._mindElixirInstance
            setTimeout(() => {
              try {
                instance.destroy && instance.destroy()
              } catch (e) {
                console.error("Delayed destroy failed:", e)
              }
            }, 0)
          }
        } catch (e) {
          console.error("Error destroying old instance:", e)
        }
        delete container._mindElixirInstance
      }

      // Clear the container safely
      if (container.firstChild) {
        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }
      }

      // Parse markdown to mind map structure
      const parsedData = parseMarkdownToMindMap(contentToUse)

      // Configure MindElixir options
      const options = {
        el: container,
        direction: 2, // right-to-left
        draggable: true,
        contextMenu: true,
        toolBar: true,
        nodeMenu: true,
        keypress: true,
        allowUndo: true,
        // Remove the theme property that's causing the error
      }

      // Initialize MindElixir
      try {
        console.log("Creating MindElixir instance with options:", options)
        const me = new MindElixir(options) as MindElixirInstance
        container._mindElixirInstance = me

        console.log("Initializing with data:", parsedData)
        me.init(parsedData)

        console.log("Mind map initialized successfully")
      } catch (initError) {
        console.error("Error during MindElixir initialization:", initError)
        setError(
          `MindElixir initialization error: ${initError instanceof Error ? initError.message : String(initError)}`
        )
      }

      // Clean up function
      return () => {
        if (!container) return
        try {
          const instance = container._mindElixirInstance
          if (instance) {
            delete container._mindElixirInstance

            setTimeout(() => {
              try {
                instance.destroy && instance.destroy()
              } catch (e) {
                console.error("Cleanup destroy error:", e)
              }
            }, 0)
          }
        } catch (e) {
          console.error("Error during cleanup:", e)
        }
      }
    } catch (err) {
      console.error("Error initializing mind map:", err)
      setError(`Failed to initialize mind map: ${err instanceof Error ? err.message : String(err)}`)
    }
  }, [loadedContent, mindElixirLoaded])

  // Set mindElixirLoaded to true after component mounts
  useEffect(() => {
    setMindElixirLoaded(true)
  }, [])

  // Render component
  return (
    <div className={`w-full h-full ${className || ""}`}>
      {isLoading ? (
        <div className="p-4 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-700">Generating mind map...</p>
        </div>
      ) : error ? (
        <div className="p-4 text-red-500">
          <div>Error: {error}</div>
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              setError(null)
              setLoadedContent(DEFAULT_MARKDOWN)
            }}
          >
            Load Default Mindmap
          </button>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="w-full h-full border border-gray-200 rounded map-container"
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: "400px",
            maxHeight: "80vh",
          }}
        ></div>
      )}
    </div>
  )
}