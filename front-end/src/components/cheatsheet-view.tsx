"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Download, Edit2, Save, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { fadeIn } from "@/lib/motion-utils"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

interface CheatsheetSection {
  id: string
  title: string
  content: string
}

interface CheatsheetColumn {
  id: string
  title: string
  sections: CheatsheetSection[]
}

interface CheatsheetViewProps {
  initialMarkdown?: string
}

export function CheatsheetView({ initialMarkdown }: CheatsheetViewProps) {
  const [title, setTitle] = useState("Markdown Cheatsheet")
  const [editingTitle, setEditingTitle] = useState(false)
  const [columns, setColumns] = useState<CheatsheetColumn[]>([
    {
      id: "col1",
      title: "Basic Syntax",
      sections: [
        {
          id: "sec1",
          title: "Headers",
          content: `# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6`,
        },
        {
          id: "sec2",
          title: "Emphasis",
          content: `*Italic text*
_Also italic text_

**Bold text**
__Also bold text__

***Bold and italic***
___Also bold and italic___`,
        },
      ],
    },
    {
      id: "col2",
      title: "Lists & Links",
      sections: [
        {
          id: "sec3",
          title: "Lists",
          content: `Unordered list:
* Item 1
* Item 2
  * Subitem 2.1
  * Subitem 2.2

Ordered list:
1. First item
2. Second item
3. Third item`,
        },
        {
          id: "sec4",
          title: "Links & Images",
          content: `[Link text](https://www.example.com)

![Alt text](image.jpg "Image title")`,
        },
      ],
    },
  ])

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
  const [tempSectionContent, setTempSectionContent] = useState("")
  const [tempSectionTitle, setTempSectionTitle] = useState("")
  const [tempColumnTitle, setTempColumnTitle] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const cheatsheetRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Initialize with provided markdown if available
  useEffect(() => {
    if (initialMarkdown) {
      // This is a simplified approach - in a real app, you'd want to parse the markdown
      // into the column/section structure more intelligently
      setColumns([
        {
          id: "col1",
          title: "Generated Content",
          sections: [
            {
              id: "sec1",
              title: "Content",
              content: initialMarkdown,
            },
          ],
        },
      ])
    }
  }, [initialMarkdown])

  const addColumn = () => {
    const newColumn: CheatsheetColumn = {
      id: `col${Date.now()}`,
      title: "New Column",
      sections: [
        {
          id: `sec${Date.now()}`,
          title: "New Section",
          content: "Add your markdown content here",
        },
      ],
    }
    setColumns([...columns, newColumn])
  }

  const deleteColumn = (columnId: string) => {
    setColumns(columns.filter((col) => col.id !== columnId))
  }

  const addSection = (columnId: string) => {
    const newSection: CheatsheetSection = {
      id: `sec${Date.now()}`,
      title: "New Section",
      content: "Add your markdown content here",
    }

    setColumns(
      columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            sections: [...col.sections, newSection],
          }
        }
        return col
      }),
    )
  }

  const deleteSection = (columnId: string, sectionId: string) => {
    setColumns(
      columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            sections: col.sections.filter((sec) => sec.id !== sectionId),
          }
        }
        return col
      }),
    )
  }

  const startEditingSection = (section: CheatsheetSection) => {
    setEditingSectionId(section.id)
    setTempSectionContent(section.content)
    setTempSectionTitle(section.title)
  }

  const saveEditingSection = (columnId: string, sectionId: string) => {
    setColumns(
      columns.map((col) => {
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
    )
    setEditingSectionId(null)
  }

  const startEditingColumn = (column: CheatsheetColumn) => {
    setEditingColumnId(column.id)
    setTempColumnTitle(column.title)
  }

  const saveEditingColumn = (columnId: string) => {
    setColumns(
      columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            title: tempColumnTitle,
          }
        }
        return col
      }),
    )
    setEditingColumnId(null)
  }

  const exportToPdf = async () => {
    if (!contentRef.current) return

    try {
      setIsExporting(true)

      // Create a clone of the content for exporting
      const contentClone = contentRef.current.cloneNode(true) as HTMLElement

      // Create a temporary container with fixed styling for export
      const tempContainer = document.createElement("div")
      tempContainer.style.position = "absolute"
      tempContainer.style.left = "-9999px"
      tempContainer.style.top = "0"
      tempContainer.style.width = "1200px" // Fixed width for consistent PDF output
      tempContainer.style.padding = "20px"
      tempContainer.style.backgroundColor = "white"
      tempContainer.style.zIndex = "-1"

      // Add the clone to the temporary container
      tempContainer.appendChild(contentClone)
      document.body.appendChild(tempContainer)

      // Wait for any images to load
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Generate the PDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      // Capture the content
      const canvas = await html2canvas(tempContainer, {
        scale: 1,
        useCORS: true,
        logging: false,
        windowWidth: 1200,
        windowHeight: tempContainer.scrollHeight,
      })

      // Convert to image
      const imgData = canvas.toDataURL("image/jpeg", 1.0)

      // Calculate how many pages we need
      const imgWidth = pdfWidth - 20 // Margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const pageCount = Math.ceil(imgHeight / (pdfHeight - 20)) // Margins

      // Add each page
      let heightLeft = imgHeight
      let position = 10 // Initial position
      let page = 0

      // Add first page
      pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight - 20

      // Add additional pages if needed
      while (heightLeft > 0) {
        page++
        position = -pdfHeight * page + 10 // Adjust position for next page
        pdf.addPage()
        pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight - 20
      }

      // Save the PDF
      pdf.save(`${title.replace(/\s+/g, "_")}.pdf`)

      // Clean up
      document.body.removeChild(tempContainer)
      setIsExporting(false)
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Failed to export PDF. Please try again.")
      setIsExporting(false)
    }
  }

  // Simple function to format markdown content for display
  const formatMarkdown = (content: string) => {
    // Replace code blocks with styled pre elements
    const formatted = content
      .replace(
        /```(\w*)([\s\S]*?)```/g,
        '<pre class="bg-gray-100 p-2 rounded my-2 overflow-x-auto text-sm font-mono">$2</pre>',
      )
      // Replace inline code with styled code elements
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>')
      // Replace headers
      .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold my-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold my-2">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-md font-bold my-2">$1</h3>')
      // Replace bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.*?)__/g, "<strong>$1</strong>")
      // Replace italic
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      // Replace links
      .replace(/\[(.*?)\]$$(.*?)$$/g, '<a href="$2" class="text-blue-500 underline">$1</a>')
      // Replace unordered lists
      .replace(/^\* (.*$)/gm, '<li class="ml-4">$1</li>')
      // Replace ordered lists
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4">$2</li>')
      // Replace paragraphs
      .replace(/^(?!<[hl]|<li|<pre|<code)(.*$)/gm, '<p class="my-1">$1</p>')
      // Replace newlines with breaks for better formatting
      .replace(/\n/g, "<br />")

    return formatted
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-green-600 text-white">
        <div className="flex items-center">
          {editingTitle ? (
            <div className="flex items-center">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mr-2 bg-white text-black"
                autoFocus
              />
              <Button size="sm" variant="ghost" className="text-white" onClick={() => setEditingTitle(false)}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <h2 className="text-xl font-bold">{title}</h2>
              <Button size="sm" variant="ghost" className="ml-2 text-white" onClick={() => setEditingTitle(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="bg-white text-green-600 hover:bg-gray-100" onClick={addColumn}>
            <Plus className="h-4 w-4 mr-1" /> Add Column
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-white text-green-600 hover:bg-gray-100"
            onClick={exportToPdf}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-1" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <div ref={cheatsheetRef} className="h-full">
          <div ref={contentRef} className="flex flex-wrap gap-4">
            <AnimatePresence>
              {columns.map((column) => (
                <motion.div
                  key={column.id}
                  className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)]"
                  variants={fadeIn("up", 0.2)}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, y: 20 }}
                >
                  <Card className="h-full">
                    <CardHeader className="bg-green-500 text-white py-2 px-4 flex flex-row items-center justify-between">
                      {editingColumnId === column.id ? (
                        <div className="flex items-center w-full">
                          <Input
                            value={tempColumnTitle}
                            onChange={(e) => setTempColumnTitle(e.target.value)}
                            className="mr-2 bg-white text-black"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white"
                            onClick={() => saveEditingColumn(column.id)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <CardTitle className="text-lg">{column.title}</CardTitle>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-white"
                              onClick={() => startEditingColumn(column)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-white"
                              onClick={() => deleteColumn(column.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </CardHeader>
                    <CardContent className="p-0">
                      {column.sections.map((section) => (
                        <div key={section.id} className="border-b last:border-b-0">
                          {editingSectionId === section.id ? (
                            <div className="p-4">
                              <Input
                                value={tempSectionTitle}
                                onChange={(e) => setTempSectionTitle(e.target.value)}
                                className="mb-2"
                                placeholder="Section title"
                              />
                              <Textarea
                                value={tempSectionContent}
                                onChange={(e) => setTempSectionContent(e.target.value)}
                                className="min-h-[200px] font-mono text-sm"
                                placeholder="Markdown content"
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
                              <div className="absolute right-2 top-2 hidden group-hover:flex space-x-1 bg-white/80 rounded p-1 shadow-sm z-10">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => startEditingSection(section)}
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-red-500"
                                  onClick={() => deleteSection(column.id, section.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <div className="bg-green-100 px-4 py-2 font-medium">{section.title}</div>
                              <div className="p-4 max-w-none">
                                <div
                                  className="markdown-content"
                                  dangerouslySetInnerHTML={{ __html: formatMarkdown(section.content) }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="p-4">
                        <Button variant="outline" className="w-full" onClick={() => addSection(column.id)}>
                          <Plus className="h-4 w-4 mr-1" /> Add Section
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

