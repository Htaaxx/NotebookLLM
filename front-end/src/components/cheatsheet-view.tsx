"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import {
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Maximize2,
  MinusCircle,
  PlusCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import "../styles/cheatsheet.css"
import cheatsheetCache from "../lib/cheatsheet-cache"

interface CheatsheetViewProps {
  initialMarkdown?: string
  selectedFiles?: any[]
}

interface CheatsheetTable {
  headers: string[]
  rows: string[][]
}

interface CheatsheetSubsection {
  id: string
  title: string
  content: string
  bulletPoints: string[]
  tables: CheatsheetTable[]
  isEditing?: boolean
  size?: number // Add size estimation for subsections
}

interface CheatsheetSection {
  id: string
  title: string
  content: string
  tables: CheatsheetTable[]
  bulletPoints: string[]
  subsections: CheatsheetSubsection[]
  isEditing?: boolean
  size?: number // Estimated size for layout
  columnIndex?: number // Track which column this section belongs to
  pageIndex?: number // Track which page this section belongs to
  isSplit?: boolean // Flag to indicate if this section is a split part
  originalId?: string // Reference to the original section ID if this is a split part
}

interface CheatsheetPage {
  id: string
  title: string
  sections: CheatsheetSection[]
  isEditing?: boolean
  processedColumnSections?: CheatsheetSection[][]
}

// Constants for layout calculations
const COLUMNS_PER_PAGE = 3
const MAX_COLUMN_HEIGHT = 230 // Maximum reasonable height for a column in mm
const SECTION_MARGIN = 15 // Space between sections in mm
const SECTION_HEADER_HEIGHT = 30 // Height of section header in mm
const BULLET_POINT_HEIGHT = 20 // Height of a bullet point in mm
const SUBSECTION_HEADER_HEIGHT = 25 // Height of subsection header in mm
const TABLE_ROW_HEIGHT = 25 // Height of a table row in mm
const CONTENT_LINE_HEIGHT = 20 // Height of a line of content in mm

export function CheatsheetView({ initialMarkdown, selectedFiles }: CheatsheetViewProps) {
  const [title, setTitle] = useState("root")
  const [subtitle, setSubtitle] = useState("Generated from selected documents")
  const [pages, setPages] = useState<CheatsheetPage[]>([])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [scale, setScale] = useState(1)
  const [fontSize, setFontSize] = useState(14)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userID, setUserID] = useState("")
  const [lastSelectedFileIds, setLastSelectedFileIds] = useState<string[]>([])
  const [isMobileView, setIsMobileView] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [noFilesSelected, setNoFilesSelected] = useState(false)
  const cheatsheetRef = useRef<HTMLDivElement>(null)
  const pagesRef = useRef<(HTMLDivElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    checkMobileView()
    window.addEventListener("resize", checkMobileView)

    return () => {
      window.removeEventListener("resize", checkMobileView)
    }
  }, [])

  // Load user ID from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("user_id")
      if (storedUserId) {
        setUserID(storedUserId)
      }
    }
  }, [])

  // Handle fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Fetch cheatsheet data from API based on selected files
  const fetchCheatsheetFromAPI = async (selectedFiles: any[]) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      console.log("No files selected for cheatsheet generation")
      setNoFilesSelected(true)
      return null
    }

    setNoFilesSelected(false)
    const documentIds = selectedFiles.map((file) => file.id)

    // Check if we have this data in cache
    const cachedData = cheatsheetCache.get(documentIds)
    if (cachedData) {
      console.log("Using cached cheatsheet data")
      return cachedData
    }

    setIsLoading(true)
    setError(null)

    try {
      let userIdToUse = userID

      if (!userIdToUse && typeof window !== "undefined") {
        const storedUserId = localStorage.getItem("user_id")
        if (storedUserId) {
          userIdToUse = storedUserId
          setUserID(storedUserId)
        }
      }

      // Use the same API endpoint as drawMindMap
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
      console.log("Received cheatsheet data:", data.substring(0, 100) + "...")

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
          console.warn("Empty markdown received from API")
          return null
        } else {
          processedData = data
        }
      }

      // Cache the processed data
      cheatsheetCache.set(documentIds, processedData)

      return processedData
    } catch (error) {
      console.error("Error fetching cheatsheet from API:", error)
      setError(`Failed to fetch cheatsheet: ${error instanceof Error ? error.message : String(error)}`)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Parse table content from markdown
  const parseTable = (tableLines: string[]): CheatsheetTable => {
    const headers: string[] = []
    const rows: string[][] = []

    // Process header row
    if (tableLines.length > 0) {
      const headerLine = tableLines[0].trim()
      const headerCells = headerLine
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell)
      headers.push(...headerCells)
    }

    // Skip separator row (line with dashes)

    // Process data rows
    for (let i = 2; i < tableLines.length; i++) {
      const rowLine = tableLines[i].trim()
      if (!rowLine || !rowLine.includes("|")) continue

      const rowCells = rowLine
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell)
      rows.push(rowCells)
    }

    return { headers, rows }
  }

  // Calculate size for a subsection
  const estimateSubsectionSize = (subsection: CheatsheetSubsection): number => {
    let size = SUBSECTION_HEADER_HEIGHT // Base size for subsection header

    // Add size for content (estimate lines)
    if (subsection.content) {
      const contentLines = Math.ceil(subsection.content.length / 50) // Rough estimate of characters per line
      size += contentLines * CONTENT_LINE_HEIGHT
    }

    // Add size for bullet points
    size += subsection.bulletPoints.length * BULLET_POINT_HEIGHT

    // Add size for tables
    subsection.tables.forEach((table) => {
      size += 30 // Table header
      size += table.rows.length * TABLE_ROW_HEIGHT
    })

    return size
  }

  // Improved size estimation for sections
  const estimateSectionSize = (section: CheatsheetSection): number => {
    // Use a much simpler calculation to avoid performance issues
    let size = 30 // Base size
    size += section.content ? Math.min(section.content.length / 10, 100) : 0
    size += section.bulletPoints.length * 15
    size += section.tables.length * 50
    size += section.subsections.length * 40
    return size
  }

  // Split a section at a logical point (between subsections)
  const splitSectionAtSubsection = (
    section: CheatsheetSection,
    maxHeight: number,
  ): { firstPart: CheatsheetSection; secondPart: CheatsheetSection } => {
    // Create copies for the split parts with a simpler approach
    const firstPart: CheatsheetSection = {
      ...section,
      id: `${section.id}-part1`,
      title: `${section.title} (Part 1)`,
      subsections: [],
      isSplit: true,
      originalId: section.id,
    }

    const secondPart: CheatsheetSection = {
      ...section,
      id: `${section.id}-part2`,
      title: `${section.title} (Part 2)`,
      subsections: [],
      isSplit: true,
      originalId: section.id,
    }

    // Simple split - half the subsections to each part
    const midpoint = Math.ceil(section.subsections.length / 2)
    firstPart.subsections = section.subsections.slice(0, midpoint)
    secondPart.subsections = section.subsections.slice(midpoint)

    // Content goes to first part
    firstPart.content = section.content
    secondPart.content = ""

    // Bullet points go to first part
    firstPart.bulletPoints = section.bulletPoints
    secondPart.bulletPoints = []

    // Tables go to first part
    firstPart.tables = section.tables
    secondPart.tables = []

    // Simple size calculation
    firstPart.size = 30 + firstPart.subsections.length * 40
    secondPart.size = 30 + secondPart.subsections.length * 40

    return { firstPart, secondPart }
  }

  // New advanced content distribution algorithm
  const distributeContentAcrossPages = (title: string, sections: CheatsheetSection[]): CheatsheetPage[] => {
    const pages: CheatsheetPage[] = []

    // First, calculate sizes for all sections but with a simpler approach
    sections.forEach((section) => {
      // Simplified size calculation to avoid excessive computation
      let size = SECTION_HEADER_HEIGHT
      size += section.content ? Math.min(section.content.length / 10, 100) : 0
      size += section.bulletPoints.length * 15
      size += section.tables.length * 50
      size += section.subsections.length * 40
      section.size = size
    })

    // Create the first page
    let currentPage: CheatsheetPage = {
      id: `page-0`,
      title: title,
      sections: [],
    }
    pages.push(currentPage)

    // Track column heights for the current page
    let columnHeights = Array(COLUMNS_PER_PAGE).fill(0)
    let currentPageIndex = 0

    // Use a simpler approach to distribute sections
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      const sectionHeight = section.size || 50 // Default size if not calculated

      // Find the column with the least content
      let targetColumn = 0
      for (let col = 1; col < COLUMNS_PER_PAGE; col++) {
        if (columnHeights[col] < columnHeights[targetColumn]) {
          targetColumn = col
        }
      }

      // Check if we need a new page (all columns exceed reasonable height)
      if (columnHeights.every((height) => height > 200)) {
        // Create a new page
        currentPageIndex++
        currentPage = {
          id: `page-${currentPageIndex}`,
          title: title,
          sections: [],
        }
        pages.push(currentPage)
        columnHeights = Array(COLUMNS_PER_PAGE).fill(0)
        targetColumn = 0
      }

      // Add section to the target column
      section.columnIndex = targetColumn
      section.pageIndex = currentPageIndex
      currentPage.sections.push(section)

      // Update the height for this column
      columnHeights[targetColumn] += sectionHeight + 10
    }

    return pages
  }

  // Format text with bold markers
  const formatText = (text: string): React.ReactNode => {
    if (!text) return null

    // Split by bold markers
    const parts = text.split(/(\*\*[^*]+\*\*)/)

    return parts.map((part, index) => {
      // Check if this part is bold (surrounded by **)
      if (part.startsWith("**") && part.endsWith("**")) {
        // Remove the ** markers and return bold text
        return <strong key={index}>{part.slice(2, -2)}</strong>
      }
      // Regular text
      return <span key={index}>{part}</span>
    })
  }

  // Render a table
  const renderTable = (table: CheatsheetTable) => {
    if (!table || (!table.headers?.length && !table.rows?.length)) {
      return null
    }

    return (
      <table className="cheatsheet-table">
        {table.headers && table.headers.length > 0 && (
          <thead>
            <tr>
              {table.headers.map((header, index) => (
                <th key={index}>{formatText(header)}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {table.rows &&
            table.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{formatText(cell)}</td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    )
  }

  // Parse markdown content to cheatsheet pages and sections
  const parseMarkdownToCheatsheet = (markdown: string) => {
    if (!markdown || markdown.trim() === "") {
      return {
        title: "root",
        subtitle: "Generated from selected documents",
        pages: [],
      }
    }

    try {
      // Normalize line endings
      markdown = markdown.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n")

      // Limit the markdown size to prevent browser freezing
      const MAX_MARKDOWN_LENGTH = 50000
      if (markdown.length > MAX_MARKDOWN_LENGTH) {
        console.log(`Limiting markdown from ${markdown.length} to ${MAX_MARKDOWN_LENGTH} characters for performance`)
        markdown = markdown.substring(0, MAX_MARKDOWN_LENGTH) + "\n\n... (content truncated for performance)"
      }

      const lines = markdown.split("\n")

      let cheatsheetTitle = "root"
      const cheatsheetSubtitle = "Generated from selected documents"
      const parsedSections: CheatsheetSection[] = []

      let currentSection: CheatsheetSection | null = null
      let currentSubsection: CheatsheetSubsection | null = null
      let sectionIndex = 0
      let subsectionIndex = 0
      let inTable = false
      let tableLines: string[] = []

      // Process each line with a more efficient approach
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        // Skip empty lines
        if (!line) {
          // If we were in a table, process it now
          if (inTable && tableLines.length > 0) {
            const table = parseTable(tableLines)

            if (currentSubsection) {
              currentSubsection.tables.push(table)
            } else if (currentSection) {
              currentSection.tables.push(table)
            }

            inTable = false
            tableLines = []
          }
          continue
        }

        // Check for title (# heading)
        if (line.startsWith("# ")) {
          cheatsheetTitle = line.substring(2).trim()
          continue
        }

        // Check for section (## heading)
        if (line.startsWith("## ")) {
          // If we were in a table, process it now
          if (inTable && tableLines.length > 0) {
            const table = parseTable(tableLines)

            if (currentSubsection) {
              currentSubsection.tables.push(table)
            } else if (currentSection) {
              currentSection.tables.push(table)
            }

            inTable = false
            tableLines = []
          }

          // Start a new section
          const sectionTitle = line.substring(3).trim()
          currentSection = {
            id: `section-${sectionIndex++}`,
            title: sectionTitle,
            content: "",
            tables: [],
            bulletPoints: [],
            subsections: [],
          }

          parsedSections.push(currentSection)
          currentSubsection = null

          // Limit the number of sections to prevent browser freezing
          if (sectionIndex > 30) {
            console.log("Limiting sections to 30 for performance")
            break
          }

          continue
        }

        // Check for subsection (### heading)
        if (line.startsWith("### ") && currentSection) {
          // If we were in a table, process it now
          if (inTable && tableLines.length > 0) {
            const table = parseTable(tableLines)

            if (currentSubsection) {
              currentSubsection.tables.push(table)
            } else if (currentSection) {
              currentSection.tables.push(table)
            }

            inTable = false
            tableLines = []
          }

          const subsectionTitle = line.substring(4).trim()
          currentSubsection = {
            id: `subsection-${subsectionIndex++}`,
            title: subsectionTitle,
            content: "",
            bulletPoints: [],
            tables: [],
          }

          currentSection.subsections.push(currentSubsection)
          continue
        }

        // Check for table start
        if (line.startsWith("|") && line.endsWith("|")) {
          if (!inTable) {
            inTable = true
            tableLines = []
          }

          tableLines.push(line)
          continue
        }

        // Check for bullet points (- or * or #### and beyond)
        if ((line.startsWith("-") || line.startsWith("*") || line.startsWith("####")) && currentSection) {
          // If we were in a table, process it now
          if (inTable && tableLines.length > 0) {
            const table = parseTable(tableLines)

            if (currentSubsection) {
              currentSubsection.tables.push(table)
            } else if (currentSection) {
              currentSection.tables.push(table)
            }

            inTable = false
            tableLines = []
          }

          const bulletContent = line.replace(/^[-*]|^####*\s+/, "").trim()

          if (currentSubsection) {
            currentSubsection.bulletPoints.push(bulletContent)
          } else {
            currentSection.bulletPoints.push(bulletContent)
          }
          continue
        }

        // Regular content
        if (currentSection) {
          if (!inTable) {
            if (currentSubsection) {
              if (currentSubsection.content) {
                currentSubsection.content += "\n" + line
              } else {
                currentSubsection.content = line
              }
            } else {
              if (currentSection.content) {
                currentSection.content += "\n" + line
              } else {
                currentSection.content = line
              }
            }
          }
        }
      }

      // Process any remaining table
      if (inTable && tableLines.length > 0) {
        const table = parseTable(tableLines)

        if (currentSubsection) {
          currentSubsection.tables.push(table)
        } else if (currentSection) {
          currentSection.tables.push(table)
        }
      }

      // Ensure each section has at least one subsection
      parsedSections.forEach((section) => {
        if (section.subsections.length === 0 && (section.content || section.bulletPoints.length > 0)) {
          section.subsections.push({
            id: `subsection-auto-${subsectionIndex++}`,
            title: "Overview",
            content: section.content,
            bulletPoints: section.bulletPoints.slice(),
            tables: section.tables.slice(),
          })
          // Move content to the subsection
          section.content = ""
          section.bulletPoints = []
          section.tables = []
        }
      })

      // Calculate sizes for all sections and subsections
      parsedSections.forEach((section) => {
        section.subsections.forEach((subsection) => {
          subsection.size = estimateSubsectionSize(subsection)
        })
        section.size = estimateSectionSize(section)
      })

      // Limit the number of sections processed at once
      const MAX_SECTIONS_PER_PAGE = 15
      if (parsedSections.length > MAX_SECTIONS_PER_PAGE) {
        console.log(`Limiting sections from ${parsedSections.length} to ${MAX_SECTIONS_PER_PAGE} for performance`)
        parsedSections.length = MAX_SECTIONS_PER_PAGE
      }

      // Distribute sections across pages
      const distributedPages = distributeContentAcrossPages(cheatsheetTitle, parsedSections)

      return {
        title: cheatsheetTitle,
        subtitle: cheatsheetSubtitle,
        pages: distributedPages,
      }
    } catch (err) {
      console.error("Error parsing markdown to cheatsheet:", err)
      return {
        title: "root",
        subtitle: "Error parsing content",
        pages: [],
      }
    }
  }

  // Load cheatsheet content when selected files change
  useEffect(() => {
    if (selectedFiles && selectedFiles.length > 0) {
      const documentIds = selectedFiles.map((file) => file.id)

      // Check if we need to refresh based on file selection changes
      const needsRefresh = cheatsheetCache.needsRefresh(lastSelectedFileIds, documentIds)

      if (needsRefresh) {
        fetchCheatsheetFromAPI(selectedFiles)
          .then((content) => {
            if (content) {
              const { title: newTitle, subtitle: newSubtitle, pages: newPages } = parseMarkdownToCheatsheet(content)
              setTitle(newTitle)
              setSubtitle(newSubtitle)
              setPages(newPages)
              setCurrentPageIndex(0)
            } else {
              setNoFilesSelected(true)
            }
          })
          .catch((err) => {
            console.error("Error fetching cheatsheet:", err)
            setError(`Failed to fetch cheatsheet: ${err instanceof Error ? err.message : String(err)}`)
          })
      }
    } else if (initialMarkdown) {
      const { title: newTitle, subtitle: newSubtitle, pages: newPages } = parseMarkdownToCheatsheet(initialMarkdown)
      setTitle(newTitle)
      setSubtitle(newSubtitle)
      setPages(newPages)
      setCurrentPageIndex(0)
    } else {
      // No files selected
      setNoFilesSelected(true)
    }
  }, [initialMarkdown, selectedFiles, lastSelectedFileIds])

  // Add this useEffect to break up the heavy computation into smaller chunks
  // Add this right after the useEffect that loads cheatsheet content
  useEffect(() => {
    if (isLoading) return

    // Use requestAnimationFrame to avoid blocking the main thread
    const processChunks = () => {
      if (pages.length === 0) return

      // Process one page at a time to avoid freezing the browser
      const pageToProcess = pages[currentPageIndex]
      if (!pageToProcess) return

      // Group sections by column
      const columnSections: CheatsheetSection[][] = [[], [], []]
      pageToProcess.sections.forEach((section) => {
        const columnIndex = section.columnIndex || 0
        if (columnIndex >= 0 && columnIndex < 3) {
          columnSections[columnIndex].push(section)
        }
      })

      // Update the page with processed sections
      const updatedPages = [...pages]
      updatedPages[currentPageIndex] = {
        ...pageToProcess,
        processedColumnSections: columnSections,
      }
      setPages(updatedPages)
    }

    // Use requestIdleCallback if available, otherwise use setTimeout
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      ;(window as any).requestIdleCallback(processChunks)
    } else {
      setTimeout(processChunks, 0)
    }
  }, [currentPageIndex, pages, isLoading])

  // Handle zoom in
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2))
  }

  // Handle zoom out
  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5))
  }

  // Handle font size increase
  const handleFontSizeIncrease = () => {
    setFontSize((prev) => Math.min(prev + 1, 24))
  }

  // Handle font size decrease
  const handleFontSizeDecrease = () => {
    setFontSize((prev) => Math.max(prev - 1, 10))
  }

  // Navigate to next page
  const nextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1)
    }
  }

  // Navigate to previous page
  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1)
    }
  }

  // Add a new page
  const addPage = () => {
    const newPage: CheatsheetPage = {
      id: `page-${pages.length}`,
      title: title,
      sections: [],
    }

    setPages([...pages, newPage])
    setCurrentPageIndex(pages.length)
  }

  // Update title across all pages
  useEffect(() => {
    if (pages.length > 0) {
      const updatedPages = pages.map((page) => ({
        ...page,
        title: title,
      }))
      setPages(updatedPages)
    }
  }, [title])

  // Update the PDF export function to handle the new column-based layout
  const handleExportPDF = async () => {
    if (pages.length === 0) return

    try {
      setIsLoading(true)

      // Create a PDF with A4 portrait dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Define A4 dimensions in mm
      const a4Width = 210
      const a4Height = 297
      const margin = 10 // 10mm margin

      // Process each page
      for (let i = 0; i < pages.length; i++) {
        // If not the first page, add a new page to the PDF
        if (i > 0) {
          pdf.addPage()
        }

        // Create a temporary container for rendering the page
        const tempContainer = document.createElement("div")
        tempContainer.style.position = "absolute"
        tempContainer.style.left = "-9999px"
        tempContainer.style.width = `${a4Width}mm`
        tempContainer.style.height = `${a4Height}mm`
        tempContainer.style.overflow = "hidden"
        tempContainer.style.backgroundColor = "white"
        document.body.appendChild(tempContainer)

        // Clone the page element
        const pageElement = pagesRef.current[i]
        if (!pageElement) {
          document.body.removeChild(tempContainer)
          continue
        }

        // Clone the page for rendering
        const clone = pageElement.cloneNode(true) as HTMLElement
        clone.style.transform = "scale(1)"
        clone.style.width = `${a4Width}mm`
        clone.style.height = `${a4Height}mm`
        clone.style.position = "relative"
        clone.style.overflow = "hidden"
        clone.style.backgroundColor = "white"
        clone.style.display = "block" // Make sure it's visible for rendering

        // Update the title in the clone to ensure consistency
        const titleElement = clone.querySelector(".cheatsheet-title")
        if (titleElement && i === 0) {
          titleElement.textContent = title
        }

        // Remove any fixed position elements
        const fixedElements = clone.querySelectorAll(
          '.fixed, .sticky, [style*="position: fixed"], [style*="position: sticky"]',
        )
        fixedElements.forEach((el) => el.parentNode?.removeChild(el))

        // Add the clone to the temporary container
        tempContainer.appendChild(clone)

        // Use html2canvas to capture the page
        const canvas = await html2canvas(clone, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: a4Width * 3.78, // Convert mm to pixels at 96 DPI
          height: a4Height * 3.78,
        })

        // Add to PDF - properly scaled to fit A4
        const imgData = canvas.toDataURL("image/jpeg", 1.0)
        pdf.addImage(imgData, "JPEG", margin, margin, a4Width - margin * 2, a4Height - margin * 2)

        // Clean up
        document.body.removeChild(tempContainer)
      }

      // Save the PDF
      pdf.save(`${title.replace(/\s+/g, "_")}.pdf`)
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Modify the renderPage function to use pre-processed sections when available
  const renderPage = (page: CheatsheetPage, pageIndex: number) => {
    // Use pre-processed sections if available
    const columnSections = page.processedColumnSections || [[], [], []]

    // If not pre-processed, group sections by column
    if (!page.processedColumnSections) {
      page.sections.forEach((section) => {
        const columnIndex = section.columnIndex || 0
        if (columnIndex >= 0 && columnIndex < 3) {
          columnSections[columnIndex].push(section)
        }
      })
    }

    return (
      <div
        key={page.id}
        className={`cheatsheet-page ${pageIndex === currentPageIndex ? "block" : "hidden"}`}
        ref={(el) => {
          pagesRef.current[pageIndex] = el
        }}
      >
        {/* Only show header on the first page */}
        {pageIndex === 0 && (
          <div className="cheatsheet-header">
            <div className="cheatsheet-title">{title}</div>
            <div className="cheatsheet-subtitle">{subtitle}</div>
            <div className="cheatsheet-date">{new Date().toLocaleDateString()}</div>
          </div>
        )}

        <div className="cheatsheet-grid" style={{ fontSize: `${fontSize}px` }}>
          {/* Render each column */}
          {columnSections.map((sections, colIndex) => (
            <div key={`col-${colIndex}`} className="cheatsheet-column">
              {sections.map((section) => renderSection(section, pageIndex))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render a section with its content and subsections
  const renderSection = (section: CheatsheetSection, pageIndex: number) => {
    if (!section) return null

    return (
      <div key={section.id} className="cheatsheet-section-wrapper">
        <div className="cheatsheet-section">
          <div className="cheatsheet-section-header">
            <div
              className="flex justify-between items-center w-full"
              onDoubleClick={() => {
                const updatedPages = [...pages]
                const sectionIndex = updatedPages[pageIndex].sections.findIndex((s) => s.id === section.id)

                if (sectionIndex !== -1) {
                  updatedPages[pageIndex].sections[sectionIndex].isEditing = true
                  setPages(updatedPages)
                }
              }}
            >
              <span>{section.title}</span>
            </div>
          </div>
          <div className="cheatsheet-section-content">
            {section.content && <p>{formatText(section.content)}</p>}

            {/* Render bullet points */}
            {section.bulletPoints && section.bulletPoints.length > 0 && (
              <ul className="cheatsheet-bullet-list">
                {section.bulletPoints.map((point, index) => (
                  <li key={index}>{formatText(point)}</li>
                ))}
              </ul>
            )}

            {/* Render tables */}
            {section.tables && section.tables.map((table, index) => <div key={index}>{renderTable(table)}</div>)}

            {/* Render subsections */}
            {section.subsections &&
              section.subsections.map((subsection, subsectionIndex) => (
                <div key={subsection.id} className="cheatsheet-subsection">
                  <h3 className="cheatsheet-subsection-title">
                    <span>{subsection.title}</span>
                  </h3>

                  {subsection.content && <p>{formatText(subsection.content)}</p>}

                  {/* Render subsection bullet points */}
                  {subsection.bulletPoints && subsection.bulletPoints.length > 0 && (
                    <ul className="cheatsheet-bullet-list">
                      {subsection.bulletPoints.map((point, pointIndex) => (
                        <li key={pointIndex}>{formatText(point)}</li>
                      ))}
                    </ul>
                  )}

                  {/* Render subsection tables */}
                  {subsection.tables &&
                    subsection.tables.map((table, tableIndex) => <div key={tableIndex}>{renderTable(table)}</div>)}
                </div>
              ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {/* Simplified Taskbar */}
      <div className="cheatsheet-header-bar sticky top-0 z-10">
        <div className="flex items-center">
          <div className="text-lg font-medium cursor-pointer" onDoubleClick={() => setEditingTitle(true)}>
            {editingTitle ? (
              <div className="flex items-center">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8 text-black bg-white mr-2"
                  autoFocus
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setEditingTitle(false)
                  }}
                />
              </div>
            ) : (
              title
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Page navigation */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevPage}
              disabled={currentPageIndex === 0}
              className="text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm mx-2 whitespace-nowrap">
              Page {currentPageIndex + 1} of {pages.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextPage}
              disabled={currentPageIndex === pages.length - 1}
              className="text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={addPage} className="text-white ml-2">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Font size controls */}
          <div className="flex items-center">
            <span className="text-sm text-white whitespace-nowrap">Font:</span>
            <Button variant="ghost" size="sm" onClick={handleFontSizeDecrease} className="text-white">
              <MinusCircle className="h-4 w-4" />
            </Button>
            <span className="text-sm text-white">{fontSize}px</span>
            <Button variant="ghost" size="sm" onClick={handleFontSizeIncrease} className="text-white">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>

          {/* Export button only */}
          <Button variant="ghost" size="sm" onClick={handleExportPDF} className="text-white" disabled={isLoading}>
            {isLoading ? (
              <>Loading...</>
            ) : (
              <>
                <Download className="h-4 w-4 mr-1" />
                <span>Export</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Control Panel - Fixed position, not affected by scaling */}
      <div className="bg-gray-100 p-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={toggleFullscreen} className="h-8">
          <Maximize2 className="h-4 w-4 mr-1" />
          <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
        </Button>
      </div>

      {/* Cheatsheet Content - Only this part should scale */}
      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
          <p className="ml-3">Generating cheatsheet... Longer files may take more time...</p>
        </div>
      ) : error ? (
        <div className="flex-grow flex items-center justify-center text-red-500">
          <p>{error}</p>
        </div>
      ) : noFilesSelected || pages.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
          <p className="mb-4">No content available. Please select files to generate a cheatsheet.</p>
          <Button onClick={addPage} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Empty Page
          </Button>
        </div>
      ) : (
        <div className="flex-grow overflow-auto p-4 cheatsheet-content-wrapper">
          <div
            className="cheatsheet-container"
            ref={cheatsheetRef}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              transition: "transform 0.2s ease",
            }}
          >
            {/* Render pages */}
            {pages.map((page, pageIndex) => renderPage(page, pageIndex))}
          </div>
        </div>
      )}
    </div>
  )
}
