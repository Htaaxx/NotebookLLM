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
import { MindMapNodeOptions } from "./mindmap-node-options"


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

  const [optionsPosition, setOptionsPosition] = useState({ x: 0, y: 0 })
  const [showOptions, setShowOptions] = useState(false)
  const [activeNode, setActiveNode] = useState<any>(null)

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

  // Fetch mindmap data from API based on selected files
  const fetchMindMapFromAPI = async (selectedFiles: any[]) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      console.log("No files selected for mindmap generation")
      return themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original
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
        return themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original
      }

      return data
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
          setMarkdown(themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original)
          setLoadedContent(themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original)
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
  }, [markdownContent, markdownFilePath, selectedFiles, currentTheme])

  // Generate unique ID for mind map nodes
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2)

  // Debug function to print all nodes and their content
  const debugNodeContent = (node: TopicNode, level = 0) => {
    const indent = '  '.repeat(level);
    console.group(`${indent}Node: "${node.topic}"`);
    console.log(`${indent}ID: ${node.id}`);
    console.log(`${indent}Detail content: ${node.detailContent ? '\n' + node.detailContent : '(none)'}`);
    console.log(`${indent}Level: ${level}`);
    
    if (node.children && node.children.length > 0) {
      console.log(`${indent}Children: ${node.children.length}`);
      node.children.forEach(child => debugNodeContent(child, level + 1));
    } else {
      console.log(`${indent}Children: none`);
    }
    console.groupEnd();
  };
  // Convert markdown content to MindElixir data structure with styling
  const parseMarkdownToMindMap = (markdown: string): MindElixirData => {
    if (!markdown || markdown.trim() === "") {
      markdown = themeTemplates[currentTheme as keyof typeof themeTemplates] || themeTemplates.original
    }

    try {
      const theme = getThemeObject()
      const lines = markdown.split("\n")
      const rootTopic = lines.find((line) => line.trim().startsWith("# "))?.replace("# ", "") || "Mind Map"
      
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

      lines.forEach((line) => {
        const trimmedLine = line.trim()
        
        // Skip empty lines and the root heading
        if (!trimmedLine || trimmedLine === `# ${rootTopic}`) return
        
        // If line starts with heading marker (#), it's a new node
        if (trimmedLine.startsWith("#")) {
          collectingDetails = false;
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
            collectingDetails = true; // Start collecting details for this node
          }
        } 
        // If line starts with "-", it's detail content for the current node
        else if (trimmedLine.startsWith("-") && collectingDetails && currentNode) {
          // Accumulate detail content
          if (currentNode.detailContent) {
            currentNode.detailContent += "\n" + line;
          } else {
            currentNode.detailContent = line;
          }
        }
        // Other content under a heading is also considered detail content
        else if (collectingDetails && currentNode) {
          if (currentNode.detailContent) {
            currentNode.detailContent += "\n" + line;
          } else {
            currentNode.detailContent = line;
          }
        }
      })
      console.log("=== DEBUG: ALL NODE CONTENT ===");
      debugNodeContent(rootNode);
      console.log("=== END DEBUG OUTPUT ===");
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

    const handleNodeClick = (node: any) => {
    console.log("Node click handler called with:", node)
    
    // Get node position to show options menu next to it
    let nodeElement = document.querySelector(`[data-nodeid="${node.id}"]`) as HTMLElement
    if (!nodeElement) {
      nodeElement = document.querySelector(`[data-id="${node.id}"]`) as HTMLElement
    }

    if (!nodeElement) {
      // Try to find by content
      const nodes = document.querySelectorAll('.map-container .node');
      for (const n of nodes) {
        const topic = n.querySelector('.topic');
        if (topic && topic.textContent === node.topic) {
          nodeElement = n as HTMLElement;
          break;
        }
      }
    }

    if (nodeElement) {
      const rect = nodeElement.getBoundingClientRect()
      const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 }
      
      // Position the options menu at the right side of the node
      const x = rect.right - containerRect.left + 10
      const y = rect.top - containerRect.top + (rect.height / 2) - 20
      console.log("Setting position:", { x, y });
      setOptionsPosition({ x, y })
      setShowOptions(true)
      setActiveNode(node)
    }else{
      console.error("Could not find node element in DOM for node:", node);
    }
  }

  const handleDetailClick = () => {
    console.log("Detail clicked for node:", activeNode)
    setShowOptions(false)
    
    if (!activeNode) return
    
    // Extract the node title and content
    const title = activeNode.topic || "Node Details"
    
    // First try to get content directly from the node object
    let content = activeNode.detailContent || ""
    
    // If no content in the node object, try to find it in the markdown
    if (!content && loadedContent) {
      const lines = loadedContent.split("\n")
      const nodeLines: string[] = []
      let foundNode = false
      let headingLevel = 0
      const nodeHeadingPattern = new RegExp(`^#+\\s+${title}\\s*$`, "i")
  
      // Find the node in the markdown content
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
  
        // Check if this line contains our node title as a heading
        if (
          line.match(/^#+\s/) &&
          (line.toLowerCase().includes(title.toLowerCase()) || nodeHeadingPattern.test(line))
        ) {
          console.log("Found node heading at line:", i, line)
          foundNode = true
          headingLevel = line.trim().split(" ")[0].length
          continue
        }
  
        if (foundNode) {
          // Stop when we reach another heading at the same or higher level
          if (line.match(/^#+\s/) && line.trim().split(" ")[0].length <= headingLevel) {
            break
          }
  
          // Add this line to our node content
          nodeLines.push(line)
        }
      }
  
      content = nodeLines.join("\n")
    }
  
    // If no content was found, use a default message
    if (!content || !content.trim()) {
      content = "No detailed content available for this node."
    }
  
    // Open the modal with this node's content
    setSelectedNode({ title, content })
    setModalOpen(true)
  }

  const handleSearchClick = () => {
    console.log("Search clicked for node:", activeNode)
    setShowOptions(false)
    // This will be implemented in the future
    alert("Search functionality will be implemented soon!")
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const optionsElement = document.querySelector('.mindmap-node-options')
      const wasClickInsideOptions = optionsElement && optionsElement.contains(e.target as Node)
      
      if (showOptions && !wasClickInsideOptions) {
        // Check if click was on a node
        const wasClickOnNode = (e.target as Element).closest('.node')
        if (!wasClickOnNode) {
          setShowOptions(false)
        }
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showOptions])

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
        contextMenu: false,
        toolBar: true,
        nodeMenu: false,
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

        // Change in the initializeMindMap function in mindmap-view.tsx
        me.bus.addListener("node_click", (node: any, event?: MouseEvent) => {
          console.log("Node clicked:", node);

          if (event && event.stopPropagation) {
            event.stopPropagation();
          }
          
          // Get the DOM element for this node
          setTimeout(() => {
            let nodeElement: HTMLElement | null = null;
            
            // Method 1: Try to find by data-id attribute
            nodeElement = document.querySelector(`[data-id="${node.id}"]`) as HTMLElement;
            
            // Method 2: Try to find by data-nodeid attribute
            if (!nodeElement) {
              nodeElement = document.querySelector(`[data-nodeid="${node.id}"]`) as HTMLElement;
            }

            // Method 3: Try to find by node content
            if (!nodeElement) {
              const nodes = document.querySelectorAll('.node');
              for (const el of Array.from(nodes)) {
                const topic = el.querySelector('.topic');
                if (topic && topic.textContent === node.topic) {
                  nodeElement = el as HTMLElement;
                  break;
                }
              }
            }
            
            if (nodeElement) {
              const rect = nodeElement.getBoundingClientRect();
              const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
              
              // Position options menu next to the node
              const x = rect.right - containerRect.left + 10;
              const y = rect.top - containerRect.top;
              
              setOptionsPosition({ x, y });
              setActiveNode(node);
              setShowOptions(true);
              
              console.log("Options menu should appear at:", { x, y });
            }
          }, 10);
        });

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

  // Test function to manually open the modal
  const testOpenModal = () => {
    setSelectedNode({
      title: "Test Node",
      content: `- This is a test bullet point
- Another bullet point
## Test Subheading
- Nested content
- More nested content`,
    })
    setModalOpen(true)
    console.log("Test modal opened")
  }

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
      />
  
      {/* Remove the Test Modal button */}
  
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
        >
          {/* Node options menu */}
          <MindMapNodeOptions
            position={optionsPosition}
            onDetail={handleDetailClick}
            onSearch={handleSearchClick}
            visible={showOptions}
            className="mindmap-node-options"
          />
        </div>
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
