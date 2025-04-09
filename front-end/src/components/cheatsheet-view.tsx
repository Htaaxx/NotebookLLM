"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Download, Edit2, Save, X, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/motion-utils"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import "../styles/cheatsheet.css"

interface CheatsheetSection {
  id: string
  title: string
  content: string
  height?: number
}

interface CheatsheetColumn {
  id: string
  sections: CheatsheetSection[]
}

interface CheatsheetPage {
  id: string
  columns: CheatsheetColumn[]
}

interface CheatsheetViewProps {
  initialMarkdown?: string
}

export function CheatsheetView({ initialMarkdown }: CheatsheetViewProps) {
  const [title, setTitle] = useState("Data Science Cheatsheet")
  const [subtitle, setSubtitle] = useState("Compiled by NoteUS")
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleDateString())
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingSubtitle, setEditingSubtitle] = useState(false)
  const [pages, setPages] = useState<CheatsheetPage[]>([
    {
      id: "page1",
      columns: [
        {
          id: "col1",
          sections: [
            {
              id: "sec1",
              title: "What is Data Science?",
              content: `Multi-disciplinary field that brings together concepts from computer science, statistics/machine learning, and data analysis to understand and extract insights from the ever-increasing amounts of data.

Two paradigms of data research.
1. **Hypothesis-Driven:** Given a problem, what kind of data do we need to help solve it?
2. **Data-Driven:** Given some data, what interesting problems can be solved with it?

The heart of data science is to always ask questions. Always be curious about the world.
1. What can we learn from this data?
2. What actions can we take once we find whatever it is we are looking for?`,
            },
          ],
        },
        {
          id: "col2",
          sections: [
            {
              id: "sec2",
              title: "Probability Overview",
              content: `Probability theory provides a framework for reasoning about likelihood of events.

**Terminology**
Experiment: procedure that yields one of a possible set of outcomes e.g. repeatedly tossing a die or coin
Sample Space S: set of possible outcomes of an experiment e.g. if tossing a die, S = {1,2,3,4,5,6}
Event E: set of outcomes of an experiment e.g. event that a roll is 5, or the event that sum of 2 rolls is 7
Probability of an Outcome s or P(s): number that satisfies 2 properties
1. for each outcome s, 0 ≤ P(s) ≤ 1
2. ∑ p(s) = 1`,
            },
          ],
        },
        {
          id: "col3",
          sections: [
            {
              id: "sec3",
              title: "Descriptive Statistics",
              content: `Provides a way of capturing a given data set or sample. There are two main types: centrality and variability measures.

**Centrality**
Arithmetic Mean: Useful to characterize symmetric distributions without outliers μX = 1/n ∑ xi
Geometric Mean: Useful for averaging ratios. Always less than arithmetic mean = √(a1a2...a3)
Median: Exact middle value among a dataset. Useful for skewed distribution or data with outliers.
Mode: Most frequent element in a dataset.`,
            },
          ],
        },
      ],
    },
  ])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [tempSectionContent, setTempSectionContent] = useState("")
  const [tempSectionTitle, setTempSectionTitle] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [fontSize, setFontSize] = useState(14)

  const cheatsheetRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Initialize with provided markdown if available
  useEffect(() => {
    if (initialMarkdown) {
      setPages([
        {
          id: "page1",
          columns: [
            {
              id: "col1",
              sections: [
                {
                  id: "sec1",
                  title: "Generated Content",
                  content: initialMarkdown,
                },
              ],
            },
            { id: "col2", sections: [] },
            { id: "col3", sections: [] },
          ],
        },
      ])
    }
  }, [initialMarkdown])

  // Add a new section to the cheatsheet
  const addSection = () => {
    const newSection: CheatsheetSection = {
      id: `sec${Date.now()}`,
      title: "New Section",
      content: "Add your content here",
    }

    // Create a copy of the current pages
    const updatedPages = [...pages]
    const currentPage = updatedPages[currentPageIndex]

    // If we don't have a current page, create one with the new section in the first column
    if (!currentPage) {
      const newPage = {
        id: `page${Date.now()}`,
        columns: [
          { id: `col${Date.now()}`, sections: [newSection] },
          { id: `col${Date.now() + 1}`, sections: [] },
          { id: `col${Date.now() + 2}`, sections: [] },
        ],
      }
      updatedPages.push(newPage)
      setPages(updatedPages)
      setCurrentPageIndex(updatedPages.length - 1)
      return
    }

    // Define maximum sections per column for A4 sizing
    // This is a more conservative number to ensure proper A4 printing
    const MAX_SECTIONS_PER_COLUMN = 4

    // Get the number of sections in each column
    const sectionCounts = currentPage.columns.map((col) => col.sections.length)

    // Find the column with the fewest sections
    const targetColumnIndex = sectionCounts.indexOf(Math.min(...sectionCounts))

    // Check if the target column has reached the maximum
    if (sectionCounts[targetColumnIndex] >= MAX_SECTIONS_PER_COLUMN) {
      // All columns on this page are full, create a new page
      const newPage = {
        id: `page${Date.now()}`,
        columns: [
          { id: `col${Date.now()}`, sections: [newSection] },
          { id: `col${Date.now() + 1}`, sections: [] },
          { id: `col${Date.now() + 2}`, sections: [] },
        ],
      }
      updatedPages.push(newPage)
      setPages(updatedPages)
      setCurrentPageIndex(updatedPages.length - 1)
    } else {
      // Add the new section to the column with the fewest sections
      currentPage.columns[targetColumnIndex].sections.push(newSection)
      setPages(updatedPages)
    }
  }

  const deleteSection = (columnId: string, sectionId: string) => {
    setPages(
      pages.map((page) => ({
        ...page,
        columns: page.columns.map((col) => {
          if (col.id === columnId) {
            return {
              ...col,
              sections: col.sections.filter((sec) => sec.id !== sectionId),
            }
          }
          return col
        }),
      })),
    )
  }

  const startEditingSection = (section: CheatsheetSection) => {
    setEditingSectionId(section.id)
    setTempSectionContent(section.content)
    setTempSectionTitle(section.title)
  }

  const saveEditingSection = (columnId: string, sectionId: string) => {
    setPages(
      pages.map((page) => ({
        ...page,
        columns: page.columns.map((col) => {
          if (col.id === columnId) {
            return {
              ...col,
              sections: col.sections.map((sec) => {
                if (sec.id === sectionId) {
                  return {
                    ...sec,
                    title: tempSectionTitle,
                    content: tempSectionContent,
                  }
                }
                return sec
              }),
            }
          }
          return col
        }),
      })),
    )
    setEditingSectionId(null)
  }

  const nextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1)
    }
  }

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1)
    }
  }

  const exportToPdf = async () => {
    if (!contentRef.current) return

    try {
      setIsExporting(true)

      // Create a PDF with A4 portrait dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // For each page in the cheatsheet
      for (let i = 0; i < pages.length; i++) {
        // If not the first page, add a new page to the PDF
        if (i > 0) {
          pdf.addPage()
        }

        // Create a temporary container for this page
        const tempContainer = document.createElement("div")
        tempContainer.className = "pdf-export-container"
        tempContainer.style.width = "210mm"
        tempContainer.style.height = "297mm"
        tempContainer.style.padding = "10mm"
        tempContainer.style.backgroundColor = "white"
        tempContainer.style.position = "absolute"
        tempContainer.style.left = "-9999px"
        tempContainer.style.top = "0"
        tempContainer.style.zIndex = "-1"
        tempContainer.style.overflow = "hidden"

        // Create the page content
        const pageContent = document.createElement("div")
        pageContent.className = "cheatsheet-container"
        pageContent.style.width = "100%"
        pageContent.style.height = "100%"
        pageContent.style.padding = "0"
        pageContent.style.margin = "0"
        pageContent.style.boxSizing = "border-box"

        // Add header only to the first page
        if (i === 0) {
          const headerDiv = document.createElement("div")
          headerDiv.className = "cheatsheet-header"
          headerDiv.style.textAlign = "center"
          headerDiv.style.marginBottom = "20px"

          const titleEl = document.createElement("h1")
          titleEl.className = "cheatsheet-title"
          titleEl.style.fontSize = "24px"
          titleEl.style.fontWeight = "bold"
          titleEl.style.margin = "0 0 5px 0"
          titleEl.textContent = title

          const subtitleEl = document.createElement("p")
          subtitleEl.className = "cheatsheet-subtitle"
          subtitleEl.style.fontSize = "14px"
          subtitleEl.style.margin = "0 0 5px 0"
          subtitleEl.textContent = subtitle

          const dateEl = document.createElement("p")
          dateEl.className = "cheatsheet-date"
          dateEl.style.fontSize = "14px"
          dateEl.style.fontStyle = "italic"
          dateEl.style.margin = "0"
          dateEl.textContent = `Last Updated ${lastUpdated}`

          headerDiv.appendChild(titleEl)
          headerDiv.appendChild(subtitleEl)
          headerDiv.appendChild(dateEl)
          pageContent.appendChild(headerDiv)
        }

        // Create grid for this page
        const gridDiv = document.createElement("div")
        gridDiv.className = "cheatsheet-grid"
        gridDiv.style.display = "grid"
        gridDiv.style.gridTemplateColumns = "repeat(3, 1fr)"
        gridDiv.style.gap = "10px"
        gridDiv.style.width = "100%"

        // Add columns for this page
        pages[i].columns.forEach((column) => {
          const columnDiv = document.createElement("div")
          columnDiv.className = "cheatsheet-column"
          columnDiv.style.display = "flex"
          columnDiv.style.flexDirection = "column"
          columnDiv.style.gap = "10px"
          columnDiv.style.width = "100%"

          // Add sections for this column
          column.sections.forEach((section) => {
            const sectionDiv = document.createElement("div")
            sectionDiv.className = "cheatsheet-section"
            sectionDiv.style.marginBottom = "10px"
            sectionDiv.style.borderRadius = "0"
            sectionDiv.style.border = "1px solid #000"
            sectionDiv.style.overflow = "hidden"
            sectionDiv.style.width = "100%"
            sectionDiv.style.breakInside = "avoid"
            sectionDiv.style.pageBreakInside = "avoid"

            // Add header
            const headerDiv = document.createElement("div")
            headerDiv.className = "cheatsheet-section-header"
            headerDiv.style.backgroundColor = "#000"
            headerDiv.style.color = "#fff"
            headerDiv.style.padding = "5px 10px"
            headerDiv.style.fontWeight = "bold"
            headerDiv.style.width = "100%"
            headerDiv.style.boxSizing = "border-box"
            headerDiv.textContent = section.title
            sectionDiv.appendChild(headerDiv)

            // Add content
            const contentDiv = document.createElement("div")
            contentDiv.className = "cheatsheet-section-content"
            contentDiv.style.padding = "10px"
            contentDiv.style.width = "100%"
            contentDiv.style.boxSizing = "border-box"
            contentDiv.style.wordWrap = "break-word"
            contentDiv.style.overflowWrap = "break-word"
            contentDiv.innerHTML = formatContent(section.content)
            sectionDiv.appendChild(contentDiv)

            columnDiv.appendChild(sectionDiv)
          })

          gridDiv.appendChild(columnDiv)
        })

        pageContent.appendChild(gridDiv)
        tempContainer.appendChild(pageContent)
        document.body.appendChild(tempContainer)

        // Wait for any images to load
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Capture the content
        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: 595, // A4 width in pixels at 72 dpi
          windowHeight: 842, // A4 height in pixels at 72 dpi
          backgroundColor: "#ffffff",
        })

        // Add to PDF
        const imgData = canvas.toDataURL("image/jpeg", 1.0)
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297) // A4 dimensions in mm

        // Clean up
        document.body.removeChild(tempContainer)
      }

      // Save the PDF
      pdf.save(`${title.replace(/\s+/g, "_")}.pdf`)
      setIsExporting(false)
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Failed to export PDF. Please try again.")
      setIsExporting(false)
    }
  }

  // Format content with basic markdown-like syntax
  const formatContent = (content: string) => {
    if (!content) return ""

    // Replace line breaks with <br> tags
    let formatted = content.replace(/\n/g, "<br>")

    // Bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    formatted = formatted.replace(/__(.*?)__/g, "<strong>$1</strong>")

    // Italic text
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>")
    formatted = formatted.replace(/_(.*?)_/g, "<em>$1</em>")

    // Highlight terms (e.g., "Term:" at the beginning of a line)
    formatted = formatted.replace(/(^|<br>)([A-Za-z\s]+):/g, '$1<span class="term">$2:</span>')

    return formatted
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-green-600 text-white cheatsheet-header-bar">
        <div className="flex items-center">
          {editingTitle ? (
            <div className="flex items-center">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mr-2 bg-white text-black"
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-green-700"
                onClick={() => setEditingTitle(false)}
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <h2 className="text-xl font-bold">Academic Cheatsheet</h2>
              <Button
                size="sm"
                variant="ghost"
                className="ml-2 text-white hover:bg-green-700"
                onClick={() => setEditingTitle(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center">
          <div className="flex items-center mr-4 text-center">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-green-700"
              onClick={prevPage}
              disabled={currentPageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="mx-2">
              <span className="font-bold">
                Page {currentPageIndex + 1} of {pages.length}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-green-700"
              onClick={nextPage}
              disabled={currentPageIndex === pages.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center mr-4">
            <span className="text-white mr-2">Font Size:</span>
            <Input
              type="number"
              min="8"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number.parseInt(e.target.value) || 14)}
              className="w-16 h-8 text-black bg-white"
            />
          </div>

          <Button
            size="sm"
            variant="outline"
            className="bg-white text-green-600 hover:bg-gray-100 mr-2"
            onClick={addSection}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Section
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="bg-white text-green-600 hover:bg-gray-100"
            onClick={exportToPdf}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-1" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-white" style={{ fontSize: `${fontSize}px` }}>
        <div ref={cheatsheetRef} className="h-full">
          <div ref={contentRef} className="cheatsheet-container">
            <div className="cheatsheet-header">
              <h1 className="cheatsheet-title">{title}</h1>
              {editingSubtitle ? (
                <div className="flex items-center justify-center mb-2">
                  <Input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-64 mr-2"
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" onClick={() => setEditingSubtitle(false)}>
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="cheatsheet-subtitle">
                  {subtitle}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-2 h-6 w-6 p-0"
                    onClick={() => setEditingSubtitle(true)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </p>
              )}
              <p className="cheatsheet-date">Last Updated {lastUpdated}</p>
            </div>

            <div className="cheatsheet-grid">
              {pages[currentPageIndex]?.columns.map((column, columnIndex) => (
                <div
                  key={column.id}
                  className="cheatsheet-column"
                  ref={(el) => {
                    columnRefs.current[column.id] = el
                  }}
                >
                  {column.sections.map((section, sectionIndex) => (
                    <motion.div
                      key={section.id}
                      className="cheatsheet-section"
                      variants={fadeIn("up", 0.2)}
                      initial="hidden"
                      animate="show"
                      exit={{ opacity: 0, y: 20 }}
                    >
                      <div className="cheatsheet-section-header">
                        {editingSectionId === section.id ? (
                          <div className="flex items-center w-full">
                            <Input
                              value={tempSectionTitle}
                              onChange={(e) => setTempSectionTitle(e.target.value)}
                              className="mr-2 bg-white text-black"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white"
                              onClick={() => saveEditingSection(column.id, section.id)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div>{section.title}</div>
                            <div className="flex space-x-1 edit-buttons">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-white"
                                onClick={() => startEditingSection(section)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-white"
                                onClick={() => deleteSection(column.id, section.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="cheatsheet-section-content">
                        {editingSectionId === section.id ? (
                          <div className="p-2">
                            <Textarea
                              value={tempSectionContent}
                              onChange={(e) => setTempSectionContent(e.target.value)}
                              className="min-h-[200px] font-serif text-sm"
                              placeholder="Content"
                            />
                            <div className="flex justify-end mt-2 space-x-2">
                              <Button size="sm" variant="outline" onClick={() => setEditingSectionId(null)}>
                                <X className="h-4 w-4 mr-1" /> Cancel
                              </Button>
                              <Button size="sm" onClick={() => saveEditingSection(column.id, section.id)}>
                                <Save className="h-4 w-4 mr-1" /> Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative group">
                            <div className="absolute right-0 top-0 hidden group-hover:flex space-x-1 bg-white/80 rounded p-1 shadow-sm z-10 edit-buttons">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => startEditingSection(section)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-500"
                                onClick={() => deleteSection(column.id, section.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: formatContent(section.content) }} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
