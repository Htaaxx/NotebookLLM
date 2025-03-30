"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { NavBar } from "@/components/nav-bar"
import { Search, Grid, List, Upload, Trash2, Eye, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { documentAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import type { FileItem } from "@/types/app-types"

export default function FilesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeCategory, setActiveCategory] = useState("All Files")
  const [files, setFiles] = useState<FileItem[]>([])
  const [userID, setUserID] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Function to load user files
  const loadUserFiles = useCallback(async (userId: string) => {
    try {
      const documents = await documentAPI.getDocuments(userId)
      if (!documents || documents.length === 0) {
        setFiles([])
        return
      }

      const loadedFiles: FileItem[] = documents.map((doc: any) => {
        const fileExtension = doc.document_name ? doc.document_name.split(".").pop()?.toLowerCase() : ""
        const fileType = getFileTypeFromExtension(fileExtension)

        return {
          id: doc.document_id,
          name: doc.document_name || "Untitled Document",
          type: fileType,
          url: `https://res.cloudinary.com/df4dk9tjq/image/upload/v1743076103/${doc.document_id}${fileExtension ? `.${fileExtension}` : ""}`,
          size: 0, // Size information not available
          selected: false,
          cloudinaryId: doc.document_id,
          FilePath: doc.document_path || "root",
        }
      })

      setFiles(loadedFiles)
    } catch (error) {
      console.error("Error loading files:", error)
    }
  }, [])

  // Load user files on component mount
  useEffect(() => {
    const storedUserID = localStorage.getItem("user_id")
    if (storedUserID) {
      setUserID(storedUserID)
      loadUserFiles(storedUserID)
    }
  }, [loadUserFiles])

  // Listen for file upload/delete events from other components
  useEffect(() => {
    const handleFileUploaded = () => {
      if (userID) {
        loadUserFiles(userID)
      }
    }

    const handleFileDeleted = () => {
      if (userID) {
        loadUserFiles(userID)
      }
    }

    window.addEventListener("fileUploaded", handleFileUploaded as EventListener)
    window.addEventListener("fileDeleted", handleFileDeleted as EventListener)

    return () => {
      window.removeEventListener("fileUploaded", handleFileUploaded as EventListener)
      window.removeEventListener("fileDeleted", handleFileDeleted as EventListener)
    }
  }, [userID, loadUserFiles])

  // Helper function to determine file type from extension
  const getFileTypeFromExtension = (extension?: string): string => {
    if (!extension) return "application/octet-stream"

    switch (extension.toLowerCase()) {
      case "pdf":
        return "application/pdf"
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return `image/${extension}`
      case "mp4":
      case "webm":
      case "mov":
        return `video/${extension}`
      case "md":
        return "text/markdown"
      default:
        return "application/octet-stream"
    }
  }

  // Filter files based on search query and active category
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeCategory === "All Files") return matchesSearch
    if (activeCategory === "Images") return matchesSearch && file.type.startsWith("image/")
    if (activeCategory === "Documents")
      return matchesSearch && (file.type === "application/pdf" || file.type === "text/markdown")
    if (activeCategory === "Videos") return matchesSearch && file.type.startsWith("video/")

    return matchesSearch
  })

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || !userID) return

    setIsUploading(true)

    try {
      // Use Promise.allSettled instead of Promise.all to handle errors better
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          // Create document in database
          const response = await documentAPI.createDocument(userID, file.name, "root")

          if (!response || !response.document_id) {
            throw new Error("Failed to generate document ID")
          }

          const documentId = response.document_id

          // Create FormData for file upload
          const formData = new FormData()
          formData.append("file", file)
          formData.append("document_id", documentId)

          // Upload file to server
          const uploadResponse = await fetch("http://localhost:5000/user/upload", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status}`)
          }

          const data = await uploadResponse.json()

          const newFile = {
            id: documentId,
            name: file.name,
            selected: false,
            type: file.type || getFileTypeFromExtension(file.name.split(".").pop()),
            url: data.url || `https://res.cloudinary.com/df4dk9tjq/image/upload/v1743076103/${documentId}`,
            size: file.size,
            cloudinaryId: documentId,
            FilePath: "root",
          }

          // Dispatch a custom event to notify other components about the new file
          window.dispatchEvent(
            new CustomEvent("fileUploaded", {
              detail: { file: newFile },
            }),
          )

          return newFile
        } catch (error) {
          console.error("Error uploading file:", error)
          return null
        }
      })

      await Promise.all(uploadPromises)

      // Refresh the file list after upload
      loadUserFiles(userID)
    } catch (error) {
      console.error("Error during file uploads:", error)
    } finally {
      setIsUploading(false)
      // Reset the file input
      if (event.target) {
        event.target.value = ""
      }
    }
  }

  // Handle file deletion
  const handleDeleteFile = async (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent event bubbling

    try {
      // Delete from storage
      await fetch("http://localhost:5000/user/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ document_id: fileId }),
      })

      // Delete from database
      await documentAPI.deleteDocument(fileId)

      // Dispatch custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("fileDeleted", {
          detail: { fileId },
        }),
      )

      // Refresh the file list after deletion
      if (userID) {
        loadUserFiles(userID)
      }
    } catch (error) {
      console.error("Error deleting file:", error)
    }
  }

  // Handle view file
  const handleViewFile = (file: FileItem) => {
    // Store the file in localStorage for the defaultPage to pick up
    localStorage.setItem("previewFile", JSON.stringify(file))
    // Set flag to automatically open the preview panel
    localStorage.setItem("showPdfPreview", "true")
    // Navigate to defaultPage
    router.push("/defaultPage")
  }

  // Render file card for grid view
  const renderFileCard = (file: FileItem) => (
    <Card
      key={file.id}
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleViewFile(file)}
    >
      <CardContent className="p-4 flex flex-col items-center">
        <div className="h-32 w-full flex items-center justify-center mb-2">
          {file.type.startsWith("image/") ? (
            <img
              src={file.url || "/placeholder.svg"}
              alt={file.name}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=128&width=128"
              }}
            />
          ) : (
            <FileText size={64} className="text-blue-500" />
          )}
        </div>
        <div className="w-full mt-2">
          <p className="text-sm font-medium truncate text-center">{file.name}</p>
          <div className="flex justify-center mt-2 space-x-2">
            <Button variant="outline" size="sm" className="h-8 px-2" onClick={(e) => handleViewFile(file)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-red-500 hover:text-red-700"
              onClick={(e) => handleDeleteFile(file.id, e)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Render file row for list view
  const renderFileRow = (file: FileItem) => (
    <div
      key={file.id}
      className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
      onClick={() => handleViewFile(file)}
    >
      <div className="mr-3">
        {file.type.startsWith("image/") ? (
          <img
            src={file.url || "/placeholder.svg"}
            alt={file.name}
            className="h-10 w-10 object-cover rounded"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=40&width=40"
            }}
          />
        ) : (
          <FileText className="h-10 w-10 text-blue-500" />
        )}
      </div>
      <div className="flex-grow">
        <p className="text-sm font-medium truncate">{file.name}</p>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation()
            handleViewFile(file)
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          onClick={(e) => handleDeleteFile(file.id, e)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  // Add drag and drop handlers for the entire file display area
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!e.dataTransfer.files || !userID) return

    setIsUploading(true)

    try {
      const droppedFiles = Array.from(e.dataTransfer.files)
      const uploadPromises = droppedFiles.map(async (file) => {
        try {
          // Create document in database
          const response = await documentAPI.createDocument(userID, file.name, "root")

          if (!response || !response.document_id) {
            throw new Error("Failed to generate document ID")
          }

          const documentId = response.document_id

          // Create FormData for file upload
          const formData = new FormData()
          formData.append("file", file)
          formData.append("document_id", documentId)

          // Upload file to server
          const uploadResponse = await fetch("http://localhost:5000/user/upload", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status}`)
          }

          const data = await uploadResponse.json()

          const newFile = {
            id: documentId,
            name: file.name,
            selected: false,
            type: file.type || getFileTypeFromExtension(file.name.split(".").pop()),
            url: data.url || `https://res.cloudinary.com/df4dk9tjq/image/upload/v1743076103/${documentId}`,
            size: file.size,
            cloudinaryId: documentId,
            FilePath: "root",
          }

          // Dispatch a custom event to notify other components about the new file
          window.dispatchEvent(
            new CustomEvent("fileUploaded", {
              detail: { file: newFile },
            }),
          )

          return newFile
        } catch (error) {
          console.error("Error uploading file:", error)
          return null
        }
      })

      await Promise.all(uploadPromises)

      // Refresh the file list after upload
      loadUserFiles(userID)
    } catch (error) {
      console.error("Error during file uploads:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Files</h1>
          <Button onClick={() => document.getElementById("file-upload")?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
          <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileUpload} />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <div className="flex space-x-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {["All Files", "Recent", "Images", "Documents", "Videos"].map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {isUploading && (
          <div className="text-center py-4">
            <p>Uploading files...</p>
          </div>
        )}

        {filteredFiles.length === 0 ? (
          <div
            className="text-center py-12 border-2 border-dashed rounded-lg"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No files found</h3>
            <p className="text-gray-500 mt-2">
              {searchQuery ? "Try a different search term" : "Upload files to get started"}
            </p>
            <p className="text-gray-500 mt-2">Drag and drop files here or</p>
            <Button variant="outline" className="mt-2" onClick={() => document.getElementById("file-upload")?.click()}>
              choose files
            </Button>
            <p className="text-gray-500 mt-4">Supported files: PDF, txt, Markdown, Audio files (e.g., mp3)</p>
          </div>
        ) : viewMode === "grid" ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {filteredFiles.map(renderFileCard)}
          </div>
        ) : (
          <div className="space-y-2 border rounded-lg divide-y" onDragOver={handleDragOver} onDrop={handleDrop}>
            {filteredFiles.map(renderFileRow)}
          </div>
        )}
      </main>
    </div>
  )
}

