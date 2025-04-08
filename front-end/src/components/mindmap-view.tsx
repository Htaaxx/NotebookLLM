"use client"

import { useEffect, useRef, useState } from "react"
import MindElixir from "mind-elixir"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { Button } from "@/components/ui/button"
import { Loader2, ZoomIn, ZoomOut, RotateCcw, Download } from "lucide-react"
import {
  allThemes,
  applyThemeToNode,
  customizeLines,
  themeTemplates,
  type MindMapTheme,
} from "../lib/mind-elixir-themes"
import "../styles/mindmap.css"

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
    _mindElixirInstance?: any // Use any to avoid type conflicts
  }
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
  style?: {
    background?: string
    color?: string
    fontSize?: string
    fontWeight?: string
    shape?: "oval" | "rectangle"
  }
}

interface MindElixirData {
  nodeData: {
    id: string
    topic: string
    children?: any[]
    style?: any
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
  const [currentTheme, setCurrentTheme] = useState("original")
  const [needsReinitialize, setNeedsReinitialize] = useState(false)
  const [scale, setScale] = useState(1)
  const [isExporting, setIsExporting] = useState(false)

  // Get the current theme object
  const getThemeObject = (): MindMapTheme => {
    return allThemes.find((theme) => theme.name === currentTheme) || allThemes[0]
  }

  // Handle theme change
  const handleThemeChange = (themeName: string) => {
    // First, safely destroy the current instance if it exists
    if (containerRef.current && containerRef.current._mindElixirInstance) {
      try {
        const instance = containerRef.current._mindElixirInstance
        if (typeof instance.destroy === "function") {
          instance.destroy()
        }
        delete containerRef.current._mindElixirInstance

        // Clear the container safely
        containerRef.current.innerHTML = ""
      } catch (e) {
        console.error("Error cleaning up before theme change:", e)
      }
    }

    setCurrentTheme(themeName)

    // If no custom content is loaded, use the theme's template
    if (!markdownContent && !markdownFilePath && (!selectedFiles || selectedFiles.length === 0)) {
      setLoadedContent(themeTemplates[themeName as keyof typeof themeTemplates] || themeTemplates.original)
    }

    // Use a timeout to ensure React has time to update the state before reinitializing
    setTimeout(() => {
      setNeedsReinitialize(true)
    }, 50)
  }

  // Handle zoom in
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2))

    // Apply zoom to the mind map
    if (containerRef.current && containerRef.current._mindElixirInstance) {
      const me = containerRef.current._mindElixirInstance
      me.scale(scale + 0.1)
    }
  }

  // Handle zoom out
  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5))

    // Apply zoom to the mind map
    if (containerRef.current && containerRef.current._mindElixirInstance) {
      const me = containerRef.current._mindElixirInstance
      me.scale(scale - 0.1)
    }
  }

  // Handle reset view
  const handleReset = () => {
    setScale(1)

    // Reset the mind map view
    if (containerRef.current && containerRef.current._mindElixirInstance) {
      const me = containerRef.current._mindElixirInstance
      me.scale(1)
      me.toCenter()
    }
  }

  // Export the entire mindmap to PDF
  const exportToPDF = async () => {
    if (!containerRef.current || !containerRef.current._mindElixirInstance) {
      setError("Mind map not initialized")
      return
    }

    setIsExporting(true)

    try {
      const me = containerRef.current._mindElixirInstance

      // Store current scale and position
      const currentScale = me.scaleVal
      const currentTranslate = { x: me.translateX, y: me.translateY }

      // Reset view to show the entire mindmap
      me.scale(0.8) // Scale to fit more content
      me.toCenter() // Center the mindmap

      // Wait for the DOM to update
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Get the map container (not just the visible part)
      const mapContainer = containerRef.current.querySelector(".map-container") || containerRef.current
      const mapRoot = mapContainer.querySelector(".root") || mapContainer

      // Calculate the bounding box of all nodes to capture the entire mindmap
      const nodes = mapContainer.querySelectorAll(".node")
      let minX = Number.POSITIVE_INFINITY,
        minY = Number.POSITIVE_INFINITY,
        maxX = Number.NEGATIVE_INFINITY,
        maxY = Number.NEGATIVE_INFINITY

      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect()
        minX = Math.min(minX, rect.left)
        minY = Math.min(minY, rect.top)
        maxX = Math.max(maxX, rect.right)
        maxY = Math.max(maxY, rect.bottom)
      })

      // Add padding
      const padding = 50
      minX -= padding
      minY -= padding
      maxX += padding
      maxY += padding

      // Calculate dimensions
      const width = maxX - minX
      const height = maxY - minY

      // Create a canvas with the calculated dimensions
      const canvas = await html2canvas(mapRoot as HTMLElement, {
        scale: 2, // Higher resolution
        width: width,
        height: height,
        x: minX,
        y: minY,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      // Create PDF with appropriate dimensions
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      })

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
      pdf.save("mindmap.pdf")

      // Restore original view
      me.scale(currentScale)
      me.translateX = currentTranslate.x
      me.translateY = currentTranslate.y
      me.refresh()
    } catch (err) {
      console.error("Error exporting to PDF:", err)
      setError(`Failed to export to PDF: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsExporting(false)
    }
  }

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

      // Fixed: Send document_ids as a property in the request body
      const response = await fetch("/api/drawMindMap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ document_ids: documentIds }),
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

  // Convert markdown content to MindElixir data structure with styling
  const parseMarkdownToMindMap = (markdown: string): MindElixirData => {
    if (!markdown || markdown.trim() === "") {
      markdown = themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original
    }

    try {
      const theme = getThemeObject()
      const lines = markdown.split("\n")
      const rootTopic = lines.find((line) => line.trim().startsWith("# "))?.replace("# ", "") || "Mind Map"
      const rootNode: TopicNode = {
        id: "root",
        topic: rootTopic,
        children: [],
        style: {
          background: theme.nodeColors?.root || theme.nodeStyles.root.background,
          color: theme.nodeStyles.root.color || theme.color,
          fontSize: theme.nodeStyles.root.fontSize,
          fontWeight: theme.nodeStyles.root.fontWeight,
        },
      }

      let currentLevel = 0
      const currentParentStack: TopicNode[] = [rootNode]
      let nodeIndex = 0

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

          // Get style based on level
          const styleObj = level === 1 ? theme.nodeStyles.primary : theme.nodeStyles.secondary

          // Get color based on level and index
          const colorIndex =
            nodeIndex %
            (level === 1 && theme.nodeColors?.level1
              ? theme.nodeColors.level1.length
              : level === 2 && theme.nodeColors?.level2
                ? theme.nodeColors.level2.length
                : 1)

          const background =
            level === 1 && theme.nodeColors?.level1
              ? theme.nodeColors.level1[colorIndex]
              : level === 2 && theme.nodeColors?.level2
                ? theme.nodeColors.level2[colorIndex]
                : styleObj.background

          const newNode: TopicNode = {
            id: generateId(),
            topic,
            children: [],
            style: {
              background,
              color: styleObj.color || theme.color,
              fontSize: styleObj.fontSize,
              fontWeight: styleObj.fontWeight,
            },
          }

          const currentParent = currentParentStack[currentParentStack.length - 1]

          if (!currentParent.children) {
            currentParent.children = []
          }

          currentParent.children.push(newNode)
          currentParentStack.push(newNode)
          currentLevel = level
          nodeIndex++
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

  // Apply custom styling to nodes after rendering
  const applyCustomStyling = (container: HTMLElement) => {
    if (!container) return

    const theme = getThemeObject()

    // Get all nodes
    const nodes = container.querySelectorAll(".map-container .node")

    // Apply custom styles to each node
    nodes.forEach((node, index) => {
      const nodeElement = node as HTMLElement
      const level = Number.parseInt(nodeElement.getAttribute("data-level") || "0")
      applyThemeToNode(nodeElement, theme, level, index)
    })

    // Customize connection lines
    customizeLines(container, theme)
  }

  // Effect to reinitialize when theme changes
  useEffect(() => {
    if (needsReinitialize && mindElixirLoaded) {
      // Use a timeout to ensure the DOM is ready
      const timer = setTimeout(() => {
        initializeMindMap()
        setNeedsReinitialize(false)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [needsReinitialize, mindElixirLoaded, currentTheme]) // Add currentTheme to dependencies

  // Initialize MindElixir
  const initializeMindMap = () => {
    // Skip if prerequisites aren't met
    if (!containerRef.current) return
    const container = containerRef.current

    // Use the loaded content or default
    const contentToUse =
      loadedContent || themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original
    console.log("Initializing mind map with content length:", contentToUse.length)

    try {
      // Clean up any existing instance
      if (container._mindElixirInstance) {
        try {
          if (container._mindElixirInstance.destroy) {
            const instance = container._mindElixirInstance
            try {
              instance.destroy()
            } catch (e) {
              console.error("Error destroying old instance:", e)
            }
          }
        } catch (e) {
          console.error("Error accessing destroy method:", e)
        }
        delete container._mindElixirInstance
      }

      // Clear the container safely
      try {
        // Use a safer approach to clear the container
        container.innerHTML = ""
      } catch (e) {
        console.error("Error clearing container:", e)
      }

      // Parse markdown to mind map structure
      const parsedData = parseMarkdownToMindMap(contentToUse)
      const theme = getThemeObject()

      // Configure MindElixir options
      const options = {
        el: container,
        direction: MindElixir.SIDE, // Use side direction for better layout
        draggable: true,
        contextMenu: true,
        toolBar: true,
        nodeMenu: true,
        keypress: true,
        allowUndo: true,
        overflowHidden: false,
        primaryLinkStyle: {
          lineWidth: theme.lineStyle.width,
          lineColor: theme.lineStyle.color,
        },
        primaryNodeHorizontalGap: 80,
        primaryNodeVerticalGap: 30,
      }

      // Initialize MindElixir
      try {
        console.log("Creating MindElixir instance with options:", options)
        const me = new MindElixir(options) as any // Use type assertion to any
        container._mindElixirInstance = me

        console.log("Initializing with data:", parsedData)
        me.init(parsedData)

        // Apply custom styling after initialization
        setTimeout(() => {
          applyCustomStyling(container)
        }, 100)

        console.log("Mind map initialized successfully")
      } catch (initError) {
        console.error("Error during MindElixir initialization:", initError)
        setError(
          `MindElixir initialization error: ${initError instanceof Error ? initError.message : String(initError)}`,
        )
      }
    } catch (err) {
      console.error("Error initializing mind map:", err)
      setError(`Failed to initialize mind map: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // Initialize mind map when content changes
  useEffect(() => {
    if (mindElixirLoaded) {
      // Use a timeout to ensure the DOM is ready
      const timer = setTimeout(() => {
        initializeMindMap()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [loadedContent, mindElixirLoaded])

  // Set mindElixirLoaded to true after component mounts
  useEffect(() => {
    setMindElixirLoaded(true)

    // Clean up function
    return () => {
      if (!containerRef.current) return

      try {
        const container = containerRef.current
        const instance = container._mindElixirInstance

        if (instance) {
          try {
            if (typeof instance.destroy === "function") {
              instance.destroy()
            }
          } catch (e) {
            console.error("Cleanup destroy error:", e)
          }

          delete container._mindElixirInstance
        }
      } catch (e) {
        console.error("Error during cleanup:", e)
      }
    }
  }, [])

  // Render component
  return (
    <div className={`w-full h-full flex flex-col ${className || ""}`}>
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 border-b">
        <h3 className="text-lg font-semibold">Mind Map View</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} title="Reset View">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToPDF}
            disabled={isExporting || isLoading || !!error}
            title="Export to PDF"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 text-center flex-grow flex items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-700 ml-3">Generating mind map...</p>
        </div>
      ) : error ? (
        <div className="p-4 text-red-500 flex-grow flex flex-col items-center justify-center">
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
          className="w-full flex-grow border border-gray-200 rounded map-container"
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
