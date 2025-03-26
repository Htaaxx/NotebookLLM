"use client"

import { useState, useEffect, useMemo } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { ZoomIn, ZoomOut, Highlighter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MindMapView} from "@/components/mindmap-view"
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

// Set worker options for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

interface FileItem {
  id: string
  name: string
  type: string
  url: string
  size: number
}

interface Annotation {
  page: number
  text: string
  x: number
  y: number
  width: number
  height: number
}

interface RightPanelProps {
  activePanel: "preview" | "mindmap" | "cheatsheet" | null
  selectedFiles: FileItem[]
}

const MAX_PDF_SIZE = 100 * 1024 * 1024 // Allow pdf to be only < 100MB

// Nội dung Markdown mặc định được nhúng trực tiếp
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
`;

export function RightPanel({ activePanel, selectedFiles }: RightPanelProps) {
  const [scale, setScale] = useState(1.0)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectedPage, setSelectedPage] = useState<number | null>(null)
  const [markdownContent, setMarkdownContent] = useState<string>('')
  

  const selectedPdf = useMemo(() => {
    return selectedFiles.find(
      (file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    ) || null;
  }, [selectedFiles]);

  const selectedMarkdownFile = useMemo(() => {
    return selectedFiles.find(
      (file) => file.type === "text/markdown" || file.name.toLowerCase().endsWith(".md")
    ) || null;
  }, [selectedFiles]);
  
  useEffect(() => {
    if (!selectedPdf) {
      setNumPages(null);
      setError(null);
      setScale(1.0);
    }
  }, [selectedPdf]);
  

  useEffect(() => {
    setScale(1.0)
    setError(null)
  }, [selectedPdf])

  // Đảm bảo useEffect này chạy đúng thứ tự
  useEffect(() => {
    if (activePanel === "mindmap") {
      console.log("MindMap panel active, loading default markdown content");
      
      // Đảm bảo reset error state
      setError(null);
      
      // If there's a selected file, try to load it
      if (selectedMarkdownFile) {
        console.log("Attempting to load markdown from file:", selectedMarkdownFile.name);
        
        fetch(selectedMarkdownFile.url)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to load markdown: ${response.status}`);
            }
            return response.text();
          })
          .then(text => {
            if (text && text.trim()) {
              console.log("Successfully loaded markdown, length:", text.length);
              setMarkdownContent(text);
            } else {
              console.warn("Loaded empty markdown, keeping default");
            }
          })
          .catch(err => {
            console.error("Failed to load markdown from file:", err);
            setError(`Failed to load markdown: ${err.message}`);
          });
      }
    }
  }, [activePanel, selectedMarkdownFile]);
  
  const formattedPdfName = useMemo(() => {
    return selectedPdf?.name.replace(/\.pdf$/i, "")
  }, [selectedPdf?.name])

  const handleHighlightText = () => {
    if (selectedPage === null) return

    const selection = window.getSelection()
    if (selection && selection.toString().trim() !== "") {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      // Adjust coordinates based on scale and page container
      const pdfContainer = document.getElementById(`page-container-${selectedPage}`)
      if (pdfContainer) {
        const containerRect = pdfContainer.getBoundingClientRect()
        const x = (rect.left - containerRect.left) / scale
        const y = (rect.top - containerRect.top) / scale

        setAnnotations((prev) => [
          ...prev,
          {
            page: selectedPage,
            text: selection.toString(),
            x,
            y,
            width: rect.width / scale,
            height: rect.height / scale,
          },
        ])

        // Clear selection after highlighting
        selection.removeAllRanges()
      }
    }
  }

  if (!activePanel) return null

  if (!activePanel || (selectedFiles.length === 0 && activePanel !== "mindmap")) {
    return (
      <div className="w-[42%] border-l h-[calc(100vh-64px)] p-4 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">No chosen file</p>
      </div>
    )
  }

  const handleZoomIn = () => setScale((prevScale) => Math.min(prevScale + 0.1, 2))
  const handleZoomOut = () => setScale((prevScale) => Math.max(prevScale - 0.1, 0.5))

  const onDocumentLoadSuccess = (pdf: { numPages: number }) => {
    setNumPages(pdf.numPages)
  }

  const onPageRendered = (pageNumber: number) => {
    setSelectedPage(pageNumber) // Track the currently rendered page
  }

  return (
    <div className="w-[42%] border-l h-[calc(100vh-64px)] p-4 flex flex-col">
      {activePanel === "preview" && selectedPdf && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-center bg-green-500 text-black py-2 px-4 rounded-md w-full mr-2">
              {formattedPdfName}
            </h2>
            <div className="flex gap-2">
              <Button onClick={handleZoomOut} size="sm">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button onClick={handleZoomIn} size="sm">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button onClick={handleHighlightText} size="sm" title="Highlight Selected Text">
                <Highlighter className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex-grow overflow-auto">
            {selectedPdf.size > MAX_PDF_SIZE ? (
              <p className="text-red-500">This PDF is too large to preview (max 100MB). Please download to view.</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <Document
                file={selectedPdf.url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(err) => setError(`Failed to load PDF: ${err.message}`)}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <div
                    key={`page-container-${index + 1}`}
                    id={`page-container-${index + 1}`}
                    style={{ position: "relative" }}
                  >
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      scale={scale}
                      onRenderSuccess={() => onPageRendered(index + 1)}
                    />
                    {annotations
                      .filter((annotation) => annotation.page === index + 1)
                      .map((annotation, i) => (
                        <div
                          key={`annotation-${i}`}
                          style={{
                            position: "absolute",
                            top: annotation.y * scale,
                            left: annotation.x * scale,
                            width: annotation.width * scale,
                            height: annotation.height * scale,
                            backgroundColor: "rgba(255, 255, 0, 0.5)",
                            pointerEvents: "none",
                          }}
                        />
                      ))}
                  </div>
                ))}
              </Document>
            )}
          </div>
        </>
      )}
  
      {activePanel === "mindmap" && (
        <div
          className="h-full bg-white rounded-lg grid grid-rows-[auto_1fr]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-center bg-green-500 text-black py-2 px-4 rounded-md w-full">
              {selectedMarkdownFile ? selectedMarkdownFile.name : "Machine Learning Concepts"}
            </h2>
          </div>
          <div className="min-h-0 relative">
            {error ? (
              <div className="p-4 text-red-500">{error}</div>
            ) : (
              <MindMapView 
                markdownContent={markdownContent}
                className="absolute inset-0"
              />
            )}
          </div>
        </div>
      )}
  
      {activePanel === "cheatsheet" && (
        <div className="h-full bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Cheatsheet View</p>
        </div>
      )}
    </div>
  )
}
