"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import MindElixir from "mind-elixir"
import {
  allThemes,
  applyThemeToNode,
  customizeLines,
  themeTemplates,
  type MindMapTheme,
} from "../lib/mind-elixir-themes"
import { MindMapTaskbar } from "./mindmap-taskbar"
import "../styles/mindmap.css"
import { MindMapNodeModal } from "./mindmap-node-modal"
import { documentAPI } from "@/lib/api"
import mindMapCache from "@/lib/mindmap-cache"

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
  detailContent?: string
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

interface MindMapNode {
  id: string
  topic: string
  level: number
  detailContent?: string
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
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<{ title: string; content: string } | null>(null)

  const [allNodes, setAllNodes] = useState<MindMapNode[]>([])
  const [activeNode, setActiveNode] = useState<any>(null)
  const [mindmap_node_search, setMindmapNodeSearch] = useState<string[][]>([])
  const [userID, setUserID] = useState("")
  const [lastSelectedFileIds, setLastSelectedFileIds] = useState<string[]>([])

  // Get the current theme object
  const getThemeObject = (): MindMapTheme => {
    return allThemes.find((theme) => theme.name === currentTheme) || allThemes[0]
  }

  // Handle theme change
  const handleThemeChange = (themeName: string) => {
    // Update the current theme state
    setCurrentTheme(themeName)

    // If there's no mindmap instance yet, we'll need to set a flag to initialize with the new theme
    if (!containerRef.current || !containerRef.current._mindElixirInstance) {
      // If no custom content is loaded, use the theme's template
      if (!markdownContent && !markdownFilePath && (!selectedFiles || selectedFiles.length === 0)) {
        setLoadedContent(themeTemplates[themeName as keyof typeof themeTemplates] || themeTemplates.original)
      }

      // Set flag to initialize with new theme
      setNeedsReinitialize(true)
      return
    }

    // Apply the new theme to the existing mindmap without reloading
    const theme = allThemes.find((theme) => theme.name === themeName) || allThemes[0]

    // Apply the theme to the existing nodes
    if (containerRef.current) {
      applyThemeToExistingMindmap(containerRef.current, theme)
    }
  }

  // Add this new function to apply theme to existing mindmap
  const applyThemeToExistingMindmap = (container: HTMLElement, theme: MindMapTheme) => {
    if (!container) return

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

    // Update the background color of the container
    if (container.classList.contains("map-container")) {
      container.style.background = theme.background
    } else {
      const mapContainer = container.querySelector(".map-container")
      if (mapContainer) {
        ;(mapContainer as HTMLElement).style.background = theme.background
      }
    }

    // If the container has a mind elixir instance, update its link style
    if ((container as HTMLDivElement)._mindElixirInstance) {
      const me = (container as HTMLDivElement)._mindElixirInstance
      if (me.linkController && typeof me.linkController.updateLinkStyle === "function") {
        try {
          me.linkController.updateLinkStyle({
            lineWidth: theme.lineStyle.width,
            lineColor: theme.lineStyle.color,
          })
        } catch (e) {
          console.error("Error updating link style:", e)
        }
      }
    }
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

  // Fetch mindmap data from API based on selected files
  const fetchMindMapFromAPI = async (selectedFiles: any[]) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      console.log("No files selected for mindmap generation")
      return themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original
    }

    const documentIds = selectedFiles.map((file) => file.id)

    // Check if we have this data in cache
    const cachedData = mindMapCache.get(documentIds)
    if (cachedData) {
      console.log("Using cached mindmap data")
      return cachedData
    }

    setIsLoading(true)
    setError(null)

    try {
      let userIdToUse = userID

      if (!userIdToUse && documentIds.length > 0) {
        try {
          userIdToUse = await documentAPI.getUserWithDocument(documentIds[0])
          console.log("Retrieved user ID from API:", userIdToUse)
          // Update state for future use
          setUserID(userIdToUse)
        } catch (err) {
          console.error("Failed to get user ID from API:", err)
          // Fall back to localStorage as a backup
          if (typeof window !== "undefined") {
            const storedUserId = localStorage.getItem("user_id")
            if (storedUserId) {
              userIdToUse = storedUserId
              setUserID(storedUserId)
            }
          }
        }
      }

      // Fixed: Send document_ids as a property in the request body
      const response = await fetch("/api/drawMindMap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_ids: documentIds,
          user_id: userIdToUse,
        }),
      })

      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`)
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.text()
      console.log("Received mindmap data:", data.substring(0, 100) + "...")

      // Store the document IDs for future reference
      setLastSelectedFileIds(documentIds)

      // Process the response
      let processedData: string

      // Check if the response is JSON
      try {
        const jsonData = JSON.parse(data)
        // If it's JSON and has a smaller_branches property, extract it
        if (jsonData.smaller_branches) {
          console.log("Extracted markdown from JSON response")
          processedData = jsonData.smaller_branches
        } else {
          // Otherwise, stringify the JSON for display
          processedData = JSON.stringify(jsonData, null, 2)
        }
      } catch (e) {
        // Not JSON, use as is
        if (!data || data.trim() === "") {
          console.warn("Empty markdown received from API, using default")
          processedData = themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original
        } else {
          processedData = data
        }
      }

      // Cache the processed data
      mindMapCache.set(documentIds, processedData)

      return processedData
    } catch (error) {
      console.error("Error fetching mindmap from API:", error)
      setError(`Failed to fetch mindmap: ${error instanceof Error ? error.message : String(error)}`)
      return themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original
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
          return themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original
        }
        return content
      })
      .catch((error) => {
        console.error("Error loading markdown from public folder:", error)
        throw error
      })
  }

  // Check if selected files have changed
  const haveSelectedFilesChanged = (newFiles: any[], oldFileIds: string[]) => {
    if (!newFiles || newFiles.length === 0) return oldFileIds.length > 0
    if (newFiles.length !== oldFileIds.length) return true

    const newFileIds = newFiles.map((file) => file.id).sort()
    const sortedOldFileIds = [...oldFileIds].sort()

    return newFileIds.some((id, index) => id !== sortedOldFileIds[index])
  }

  // Load markdown content from API when selected files change
  useEffect(() => {
    // Only fetch new data if the selected files have actually changed
    const filesChanged = haveSelectedFilesChanged(selectedFiles || [], lastSelectedFileIds)

    if (selectedFiles && selectedFiles.length > 0) {
      if (filesChanged) {
        console.log("Selected files changed, fetching new mindmap data")
        fetchMindMapFromAPI(selectedFiles)
          .then((content) => {
            setMarkdown(content)
            setLoadedContent(content)
          })
          .catch((err) => {
            console.error("Error fetching mindmap:", err)
            setError(`Failed to fetch mindmap: ${err instanceof Error ? err.message : String(err)}`)
            setMarkdown(themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original)
            setLoadedContent(themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original)
          })
      } else {
        console.log("Selected files unchanged, using existing mindmap data")
      }
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
          setMarkdown(themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original)
          setLoadedContent(themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original)
        })
    } else if (markdownContent) {
      // If direct markdown content is provided
      setMarkdown(markdownContent)
      setLoadedContent(markdownContent)
    } else {
      // Default case - use the current theme's template
      setMarkdown(themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original)
      setLoadedContent(themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original)
    }
  }, [markdownContent, markdownFilePath, selectedFiles]) // Removed currentTheme from dependencies

  // Generate unique ID for mind map nodes
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2)

  // Convert markdown content to MindElixir data structure with styling
  const parseMarkdownToMindMap = (markdown: string): MindElixirData => {
    if (!markdown || markdown.trim() === "") {
      markdown = themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original
    }

    try {
      const theme = getThemeObject()

      // Normalize line endings and handle escaped newlines
      markdown = markdown.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n")

      const lines = markdown.split("\n")

      // Find the root topic - either the first # line or use "Mind Map" as default
      let rootTopic = "Mind Map"
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine.startsWith("# ")) {
          rootTopic = trimmedLine.substring(2).trim()
          break
        }
      }

      // Create root node
      const rootNode: TopicNode = {
        id: "root",
        topic: rootTopic,
        children: [],
        detailContent: "", // Add property to store detail content
        style: {
          background: theme.nodeColors?.root || theme.nodeStyles.root.background,
          color: theme.nodeStyles.root.color || theme.color,
          fontSize: theme.nodeStyles.root.fontSize,
          fontWeight: theme.nodeStyles.root.fontWeight,
        },
      }

      let currentLevel = 0
      let currentNode: TopicNode | null = null
      const currentParentStack: TopicNode[] = [rootNode]
      let nodeIndex = 0
      let collectingDetails = false

      // Process each line
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const trimmedLine = line.trim()

        // Skip empty lines and the root heading if it matches
        if (!trimmedLine || trimmedLine === `# ${rootTopic}`) continue

        // If line starts with heading marker (#), it's a new node
        if (trimmedLine.startsWith("#")) {
          collectingDetails = false

          // Count the number of # to determine the level
          let hashCount = 0
          for (let j = 0; j < trimmedLine.length; j++) {
            if (trimmedLine[j] === "#") hashCount++
            else break
          }

          // Extract the topic text
          const topic = trimmedLine.substring(hashCount).trim()

          // Skip if topic is empty
          if (!topic) continue

          // Determine the level (1-based)
          const level = hashCount - 1

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
            detailContent: "", // Initialize empty detail content
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
          currentNode = newNode
          collectingDetails = true // Start collecting details for this node
        }
        // If line starts with "-", it's detail content for the current node
        else if (trimmedLine.startsWith("-") && collectingDetails && currentNode) {
          // Accumulate detail content
          if (currentNode.detailContent) {
            currentNode.detailContent += "\n" + line
          } else {
            currentNode.detailContent = line
          }
        }
        // Other content under a heading is also considered detail content
        else if (collectingDetails && currentNode) {
          if (currentNode.detailContent) {
            currentNode.detailContent += "\n" + line
          } else {
            currentNode.detailContent = line
          }
        }
      }

      // After parsing is complete, collect all nodes
      const allNodesInMap = collectAllNodes(rootNode)
      setAllNodes(allNodesInMap)

      return { nodeData: rootNode as any }
    } catch (err) {
      console.error("Error parsing markdown to mind map:", err)
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
  }, [needsReinitialize, mindElixirLoaded]) // Removed currentTheme from dependencies

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
        zoomable: true,
        scale: 1,
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

  // Function to collect all nodes recursively
  const collectAllNodes = (node: TopicNode, level = 0, result: MindMapNode[] = []) => {
    result.push({
      id: node.id,
      topic: node.topic,
      level,
      detailContent: node.detailContent,
    })

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => collectAllNodes(child, level + 1, result))
    }

    return result
  }

  // Handle node selection from dropdown
  const handleNodeSelect = (node: MindMapNode) => {
    console.log("Node selected from dropdown:", node)
    setActiveNode(node)

    // Show the modal with node details
    setSelectedNode({
      title: node.topic,
      content: node.detailContent || "No detailed content for this node.",
    })
    setModalOpen(true)
  }

  // Helper function to build a parent map
  const buildParentMap = (node: any, parent: MindMapNode | null, parentMap: Map<string, MindMapNode>) => {
    if (parent) {
      parentMap.set(node.id, parent)
    }

    if (node.children && node.children.length) {
      node.children.forEach((child: any) => {
        buildParentMap(child, node, parentMap)
      })
    }
  }

  // Function to find path from root to node
  const findNodePath = (targetNode: MindMapNode): string[] => {
    // Start by finding the node in our flat list
    if (!allNodes.length) return [targetNode.topic]

    // Create a map for quick parent lookup
    const nodeMap = new Map<string, MindMapNode>()
    const parentMap = new Map<string, MindMapNode>()

    // First, create a map of all nodes by ID
    allNodes.forEach((node) => {
      nodeMap.set(node.id, node)
    })

    // Build parent-child relationships
    for (const node of allNodes) {
      if (containerRef.current && containerRef.current._mindElixirInstance) {
        const mindElixir = containerRef.current._mindElixirInstance
        if (mindElixir.nodeData && mindElixir.nodeData.children) {
          buildParentMap(mindElixir.nodeData, null, parentMap)
        }
      }
    }

    // Now trace back from target to root
    const path: string[] = []
    let current: MindMapNode | undefined = targetNode

    // Build the path from node to root (we'll reverse it later)
    while (current) {
      path.unshift(current.topic) // Add to the beginning

      // Get the parent from our map
      const parentNode = parentMap.get(current.id)
      current = parentNode
    }

    return path
  }

  // Handler for when search icon is clicked
  const handleNodeSearch = (node: MindMapNode) => {
    console.log("Search clicked for node:", node.topic)

    // Find the path from root to this node
    const path = findNodePath(node)

    // Add this path to our search list if not already present
    const pathExists = mindmap_node_search.some((p) => p.join(",") === path.join(","))

    if (!pathExists) {
      // Create new paths array with the new path
      const newPaths = [...mindmap_node_search, path]
      setMindmapNodeSearch(newPaths)

      // Send the updated paths collection to the chat box
      const searchEvent = new CustomEvent("mindmap_paths_updated", {
        detail: {
          paths: newPaths,
          latestNode: {
            id: node.id,
            topic: node.topic,
          },
        },
      })

      // Dispatch the event
      window.dispatchEvent(searchEvent)
    }
  }

  // Add this function to MindMapView
  const handleRemoveSearchPath = (index: number) => {
    setMindmapNodeSearch((prevPaths) => {
      const newPaths = [...prevPaths]
      newPaths.splice(index, 1)
      return newPaths
    })
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

  // Listen for file deselection events to invalidate cache
  useEffect(() => {
    const handleFileDeselection = (event: CustomEvent) => {
      if (event.detail && event.detail.fileIds) {
        // Invalidate cache for the deselected files
        mindMapCache.invalidate(event.detail.fileIds)
        // Reset lastSelectedFileIds if they match the deselected files
        if (lastSelectedFileIds.length > 0 && lastSelectedFileIds.every((id) => event.detail.fileIds.includes(id))) {
          setLastSelectedFileIds([])
        }
      }
    }

    window.addEventListener("filesDeselected", handleFileDeselection as EventListener)

    return () => {
      window.removeEventListener("filesDeselected", handleFileDeselection as EventListener)
    }
  }, [lastSelectedFileIds])

  // Render component
  return (
    <div className={`w-full h-full flex flex-col ${className || ""}`}>
      <MindMapTaskbar
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        containerRef={containerRef as React.RefObject<HTMLDivElement>}
        nodes={allNodes}
        onNodeSelect={handleNodeSelect}
        onNodeSearch={handleNodeSearch} // Add this
        searchPaths={mindmap_node_search} // Add this
        onRemoveSearchPath={handleRemoveSearchPath} // Add this
      />

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
              setLoadedContent(themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original)
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
            background: getThemeObject().background,
          }}
        ></div>
      )}

      <MindMapNodeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedNode?.title || ""}
        content={selectedNode?.content || ""}
      />
    </div>
  )
}
