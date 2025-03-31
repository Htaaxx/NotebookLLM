"use client"

import type React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import { Search, ChevronRight, ChevronDown, Trash2, Plus, MessageSquare, X, FileText, Folder } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { documentAPI } from "@/lib/api"
import { useLanguage } from "@/lib/language-context"
import { searchFiles, searchChats } from "@/lib/search-utils"
import type { FileItem, Folder as FolderType, ChatItem, DragItem } from "../types/app-types"
import "../styles/file-collection.css"

interface FileCollectionProps {
  onFileSelect: (files: FileItem[]) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_VIDEO_SIZE = 100 * 1024 * 1024

const FOLDERS_STORAGE_KEY = "userFolders"

// Validates file size based on file type
const validateFileSize = (file: File): string | null => {
  if (file.type.startsWith("image/") && file.size > MAX_IMAGE_SIZE) {
    return `Image "${file.name}" exceeds the maximum size of 10MB!`
  }
  if (file.type.startsWith("video/") && file.size > MAX_VIDEO_SIZE) {
    return `Video "${file.name}" exceeds the maximum size of 100MB!`
  }
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/") && file.size > MAX_FILE_SIZE) {
    return `File "${file.name}" exceeds the maximum size of 10MB!`
  }
  return null
}

export function FileCollection({ onFileSelect }: FileCollectionProps) {
  const { t } = useLanguage()
  const [userID, setUserID] = useState("User")
  const [rootFiles, setRootFiles] = useState<FileItem[]>([])
  const [rootFolders, setRootFolders] = useState<FolderType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{
    files: FileItem[]
    folders: FolderType[]
    chats: ChatItem[]
  } | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [showNewFolderInput, setShowNewFolderInput] = useState<boolean | string>(false)
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [chatboxes, setChatboxes] = useState<ChatItem[]>([])
  const [showNewChatInput, setShowNewChatInput] = useState<boolean>(false)
  const [newChatName, setNewChatName] = useState("")
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<string[]>([])
  const dataFetchedRef = useRef(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Determines file type based on filename
  const getFileTypeFromName = (filename: string): string => {
    if (!filename) return "document"

    const extension = filename.split(".").pop()?.toLowerCase()

    if (!extension) return "document"

    if (["pdf"].includes(extension)) return "application/pdf"
    if (["jpg", "jpeg", "png", "gif", "svg"].includes(extension)) return "image/" + extension
    if (["mp4", "webm", "mov"].includes(extension)) return "video/" + extension
    if (["md", "markdown"].includes(extension)) return "text/markdown"

    return "document"
  }

  // Extracts file extension from filename
  const getFileExtension = (filename: string): string => {
    if (!filename) return ""
    const extensionMatch = filename.match(/\.[^.]+$/)
    return extensionMatch ? extensionMatch[0].toLowerCase() : ""
  }

  // Gets file path based on folder hierarchy
  const getFilePath = useCallback(
    (folderId?: string): string => {
      if (!folderId) {
        return "root"
      }

      const findFolderPath = (folders: FolderType[], targetId: string, currentPath = "root"): string | null => {
        for (const folder of folders) {
          if (folder.id === targetId) {
            return currentPath + "/" + folder.name
          }

          const path = findFolderPath(folder.folders, targetId, currentPath + "/" + folder.name)
          if (path) return path
        }
        return null
      }

      const path = findFolderPath(rootFolders, folderId)
      return path || "root"
    },
    [rootFolders],
  )

  // Gets full path for a file
  const getFullFilePath = useCallback(
    (fileId: string, folderId?: string): string => {
      if (!folderId) {
        const file = rootFiles.find((f) => f.id === fileId)
        return file ? file.name : "Unknown file"
      }

      const folderPath = getFilePath(folderId).replace("root/", "")
      const findFileInFolders = (folders: FolderType[], targetFolderId: string, fileId: string): string | null => {
        for (const folder of folders) {
          if (folder.id === targetFolderId) {
            const file = folder.files.find((f) => f.id === fileId)
            return file ? `${folderPath}/${file.name}` : null
          }

          const result = findFileInFolders(folder.folders, targetFolderId, fileId)
          if (result) return result
        }
        return null
      }

      return findFileInFolders(rootFolders, folderId, fileId) || "Unknown file"
    },
    [rootFiles, rootFolders, getFilePath],
  )

  // Gets full path for a folder
  const getFullFolderPath = useCallback(
    (folderId: string): string => {
      return getFilePath(folderId).replace("root/", "")
    },
    [getFilePath],
  )

  // Loads folders from localStorage
  const loadFoldersFromStorage = useCallback((userId: string) => {
    try {
      const storedFolders = localStorage.getItem(`${FOLDERS_STORAGE_KEY}_${userId}`)
      if (storedFolders) {
        return JSON.parse(storedFolders) as FolderType[]
      }
    } catch (error) {
      console.error("Error loading folders from localStorage:", error)
    }
    return []
  }, [])

  // Saves folders to localStorage when they change
  useEffect(() => {
    if (userID && rootFolders.length > 0) {
      try {
        localStorage.setItem(`${FOLDERS_STORAGE_KEY}_${userID}`, JSON.stringify(rootFolders))
      } catch (error) {
        console.error("Error saving folders to localStorage:", error)
      }
    }
  }, [rootFolders, userID])

  // Handles search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults(null)
      return
    }

    const fileResults = searchFiles(searchQuery, rootFiles, rootFolders)
    const chatResults = searchChats(searchQuery, chatboxes)

    setSearchResults({
      files: fileResults.files,
      folders: fileResults.folders,
      chats: chatResults,
    })
  }

  // Clears search results
  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults(null)
  }

  // Displays user files from API and localStorage
  const handleDisplayUserFiles = useCallback(
    async (userId: string) => {
      try {
        console.log("Loading documents for user:", userId)
        const documents = await documentAPI.getDocuments(userId)

        const storedFolders = loadFoldersFromStorage(userId)

        const newRootFiles: FileItem[] = []

        const newRootFolders: FolderType[] = storedFolders
          ? storedFolders.map((folder) => ({
              ...folder,
              files: [],
              folders: clearFilesFromFolders(folder.folders),
            }))
          : []

        if (!documents || documents.length === 0) {
          console.log("No documents found for user")
          setRootFolders(newRootFolders)
          setRootFiles([])
          return
        }

        console.log("Documents loaded:", documents.length)

        const filesByPath: Record<string, any[]> = {}

        documents.forEach((doc: { document_id: string; document_name: string; document_path: string }) => {
          const path = doc.document_path || "root"
          console.log(`Document ${doc.document_id} has path: ${path}`)

          if (!filesByPath[path]) {
            filesByPath[path] = []
          }
          filesByPath[path].push(doc)
        })

        if (filesByPath["root"]) {
          filesByPath["root"].forEach((doc) => {
            const fileExtension = getFileExtension(doc.document_name)
            const cloudinaryURL = `https://res.cloudinary.com/df4dk9tjq/image/upload/v1743076103/${doc.document_id}${fileExtension}`
            console.log("Cloudinary URL:", cloudinaryURL)

            const fileType = doc.document_name ? getFileTypeFromName(doc.document_name) : "document"

            newRootFiles.push({
              id: doc.document_id,
              name: doc.document_name || "Untitled Document",
              selected: false,
              type: fileType,
              url: cloudinaryURL,
              size: 0,
              cloudinaryId: doc.document_id,
              FilePath: "root",
            })
          })
        }

        const findOrCreateFolderPath = (
          folders: FolderType[],
          pathParts: string[],
          currentIndex = 0,
          currentPath = "root",
        ): { folder: FolderType; path: string } | null => {
          if (currentIndex >= pathParts.length) return null

          const folderName = pathParts[currentIndex]
          let folder = folders.find((f) => f.name === folderName)

          if (!folder) {
            folder = {
              id: Math.random().toString(36).substr(2, 9),
              name: folderName,
              files: [],
              folders: [],
              selected: false,
              expanded: true,
            }
            folders.push(folder)
          }

          const newPath = `${currentPath}/${folderName}`

          if (currentIndex === pathParts.length - 1) {
            return { folder, path: newPath }
          }

          return findOrCreateFolderPath(folder.folders, pathParts, currentIndex + 1, newPath)
        }

        Object.keys(filesByPath).forEach((path) => {
          if (path === "root") return

          const pathParts = path.split("/").filter((p) => p !== "root")
          if (pathParts.length === 0) return

          const result = findOrCreateFolderPath(newRootFolders, pathParts)

          if (result) {
            const { folder } = result

            folder.files.push(
              ...filesByPath[path].map((doc) => {
                const fileExtension = getFileExtension(doc.document_name)
                const cloudinaryURL = `https://res.cloudinary.com/df4dk9tjq/image/upload/v1743076103/${doc.document_id}${fileExtension}`

                const fileType = doc.document_name ? getFileTypeFromName(doc.document_name) : "document"

                return {
                  id: doc.document_id,
                  name: doc.document_name || "Untitled Document",
                  selected: false,
                  type: fileType,
                  url: cloudinaryURL,
                  size: 0,
                  cloudinaryId: doc.document_id,
                  FilePath: path,
                }
              }),
            )
          }
        })

        console.log("Setting state with files:", newRootFiles.length, "and folders:", newRootFolders.length)

        setRootFiles(newRootFiles)
        setRootFolders(newRootFolders)
      } catch (error) {
        console.error("Error displaying user files:", error)
      }
    },
    [loadFoldersFromStorage],
  )

  // Recursively clears files from folders
  const clearFilesFromFolders = (folders: FolderType[]): FolderType[] => {
    return folders.map((folder) => ({
      ...folder,
      files: [],
      folders: clearFilesFromFolders(folder.folders),
    }))
  }

  // Loads user files on component mount
  useEffect(() => {
    const storedUserID = localStorage.getItem("user_id")
    if (storedUserID && !dataFetchedRef.current) {
      setUserID(storedUserID)
      dataFetchedRef.current = true
      handleDisplayUserFiles(storedUserID)
    }
  }, [handleDisplayUserFiles])

  // Listens for file upload/delete events
  useEffect(() => {
    let handleFileUploaded: (event: CustomEvent) => void
    let handleFileDeleted: (event: CustomEvent) => void

    handleFileUploaded = (event: CustomEvent) => {
      if (userID) {
        handleDisplayUserFiles(userID)
      }
    }

    handleFileDeleted = (event: CustomEvent) => {
      if (userID) {
        handleDisplayUserFiles(userID)
      }
    }

    window.addEventListener("fileUploaded", handleFileUploaded as EventListener)
    window.addEventListener("fileDeleted", handleFileDeleted as EventListener)

    return () => {
      window.removeEventListener("fileUploaded", handleFileUploaded as EventListener)
      window.removeEventListener("fileDeleted", handleFileDeleted as EventListener)
    }
  }, [userID, handleDisplayUserFiles])

  // Updates folder contents recursively
  const updateFolderContents = useCallback(
    (folders: FolderType[], folderId: string, updateFn: (folder: FolderType) => FolderType): FolderType[] => {
      return folders.map((folder) => {
        if (folder.id === folderId) {
          return updateFn(folder)
        }
        return {
          ...folder,
          folders: updateFolderContents(folder.folders, folderId, updateFn),
        }
      })
    },
    [],
  )

  // Helper function to handle upload
  const handleUpload = async (file: File, documentId: string, filePath: string): Promise<FileItem | null> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("document_id", documentId)

    try {
      // Upload file to server
      const uploadResponse = await fetch("http://localhost:5000/user/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`)
      }

      const data = await uploadResponse.json()
      console.log("Upload successful:", data)

      // Try to call the embeddings API separately
      try {
        // The correct endpoint from Swagger is /store_embeddings with documentID as query param
        const embeddingsUrl = `http://localhost:8000/store_embeddings?documentID=${documentId}`
        console.log("Calling embeddings API:", embeddingsUrl)

        // Use a timeout to avoid blocking the UI
        setTimeout(async () => {
          try {
            // Send the same formData to the embeddings API
            const embeddingsResponse = await fetch(embeddingsUrl, {
              method: "POST",
              body: formData,
            })

            if (embeddingsResponse.ok) {
              const responseText = await embeddingsResponse.text()
              console.log("Embeddings stored successfully:", responseText)
            } else {
              console.warn("Embeddings API returned error:", embeddingsResponse.status)
            }
          } catch (err) {
            console.warn("Embeddings API call failed, but continuing:", err)
          }
        }, 100)
      } catch (embeddingsError) {
        console.warn("Failed to trigger embeddings, but continuing:", embeddingsError)
      }

      // Return the file item regardless of embeddings success
      return {
        id: documentId,
        name: file.name,
        selected: false,
        type: file.type,
        url: data.url || `https://res.cloudinary.com/df4dk9tjq/image/upload/v1743076103/${documentId}`,
        size: file.size,
        cloudinaryId: documentId,
        FilePath: filePath,
      }
    } catch (error) {
      console.error("Error in upload process:", error)
      return null
    }
  }

  // Update the file upload handler to ensure it doesn't cause duplicates
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>, userID: string, folderId?: string) => {
      const uploadedFiles = event.target.files
      if (!uploadedFiles) return

      const invalidFiles: string[] = []
      const validFilesArray: File[] = []

      Array.from(uploadedFiles).forEach((file) => {
        const error = validateFileSize(file)
        if (error) {
          invalidFiles.push(error)
        } else {
          validFilesArray.push(file)
        }
      })

      if (invalidFiles.length > 0) {
        alert(invalidFiles.join("\n"))
        return
      }

      // Generate the file path for this upload
      const filePath = getFilePath(folderId)
      console.log("Uploading to path:", filePath)

      try {
        const uploadPromises = validFilesArray.map(async (file) => {
          try {
            // Pass the filePath to createDocument
            const response = await documentAPI.createDocument(userID, file.name, filePath)

            if (!response || !response.document_id) {
              throw new Error("Failed to generate document ID")
            }

            const documentId = response.document_id
            console.log("Document ID:", documentId, "with path:", response.document_path)

            // Use our new helper function for upload
            const newFile = await handleUpload(file, documentId, response.document_path || filePath)

            if (newFile) {
              // Dispatch a custom event to notify other components about the new file
              window.dispatchEvent(
                new CustomEvent("fileUploaded", {
                  detail: { file: newFile },
                }),
              )
            }

            return newFile
          } catch (error) {
            console.error("Error uploading file:", error)
            return null
          }
        })

        // Wait for all uploads to complete
        const results = await Promise.all(uploadPromises)
        const successfulUploads = results.filter((result) => result !== null)

        if (successfulUploads.length === 0) {
          console.warn("No files were successfully uploaded")
        } else {
          console.log(`Successfully uploaded ${successfulUploads.length} files`)
        }

        // Refresh the file list after upload - but reset the dataFetchedRef first
        // to ensure we get a fresh load
        dataFetchedRef.current = false
        handleDisplayUserFiles(userID)
      } catch (error) {
        console.error("Error during file uploads:", error)
      }
    },
    [getFilePath, handleDisplayUserFiles],
  )

  // Creates a new folder
  const createFolder = useCallback(
    (parentId?: string) => {
      if (newFolderName.trim()) {
        const newFolder: FolderType = {
          id: Math.random().toString(36).substr(2, 9),
          name: newFolderName,
          files: [],
          folders: [],
          selected: false,
          expanded: false,
        }
        if (parentId) {
          setRootFolders((prevFolders) => {
            return updateFolderContents(prevFolders, parentId, (folder) => ({
              ...folder,
              folders: [...folder.folders, newFolder],
            }))
          })
        } else {
          setRootFolders((prev) => [...prev, newFolder])
        }
        setNewFolderName("")
        setShowNewFolderInput(false)
      }
    },
    [newFolderName, updateFolderContents],
  )

  // Toggles folder expansion
  const toggleFolder = useCallback(
    (folderId: string) => {
      setRootFolders((prevFolders) => {
        return updateFolderContents(prevFolders, folderId, (folder) => ({
          ...folder,
          expanded: !folder.expanded,
        }))
      })
    },
    [updateFolderContents],
  )

  // Toggles folder selection
  const toggleFolderSelection = useCallback(
    (folderId: string) => {
      setRootFolders((prevFolders) => {
        return updateFolderContents(prevFolders, folderId, (folder) => ({
          ...folder,
          selected: !folder.selected,
          files: folder.files.map((file) => ({
            ...file,
            selected: !folder.selected,
          })),
          folders: folder.folders.map((subFolder) => ({
            ...subFolder,
            selected: !folder.selected,
          })),
        }))
      })
    },
    [updateFolderContents],
  )

  // Finds a folder by ID
  const findFolderById = (folders: FolderType[], folderId: string): FolderType | null => {
    for (const folder of folders) {
      if (folder.id === folderId) {
        return folder
      }

      const subFolder = findFolderById(folder.folders, folderId)
      if (subFolder) {
        return subFolder
      }
    }

    return null
  }

  // Toggles file selection
  const toggleFileSelection = useCallback(
    (fileId: string, folderId?: string) => {
      if (folderId) {
        setRootFolders((prevFolders) => {
          return updateFolderContents(prevFolders, folderId, (folder) => ({
            ...folder,
            files: folder.files.map((file) => (file.id === fileId ? { ...file, selected: !file.selected } : file)),
          }))
        })
      } else {
        setRootFiles((files) =>
          files.map((file) => (file.id === fileId ? { ...file, selected: !file.selected } : file)),
        )
      }
    },
    [updateFolderContents],
  )

  // Deletes a file
  const deleteFile = useCallback(
    async (fileId: string, folderId?: string) => {
      try {
        const response = await fetch("http://localhost:5000/user/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ document_id: fileId }),
        })

        const data = await response.json()
        await documentAPI.deleteDocument(data.document_id)

        window.dispatchEvent(
          new CustomEvent("fileDeleted", {
            detail: { fileId },
          }),
        )

        dataFetchedRef.current = false
        if (userID) {
          handleDisplayUserFiles(userID)
        }
      } catch (error) {
        console.error("Error deleting file:", error)
      }
    },
    [userID, handleDisplayUserFiles],
  )

  // Deletes a folder and all its contents
  const deleteFolder = useCallback(
    async (folderId: string, parentId?: string) => {
      try {
        const folderToDelete = findFolderById(rootFolders, folderId)
        if (!folderToDelete) {
          console.error("Folder not found:", folderId)
          return
        }

        const filesToDelete: string[] = []
        const collectFilesRecursively = (folder: FolderType) => {
          folder.files.forEach((file) => filesToDelete.push(file.id))
          folder.folders.forEach((subfolder) => collectFilesRecursively(subfolder))
        }

        collectFilesRecursively(folderToDelete)

        for (const fileId of filesToDelete) {
          try {
            await fetch("http://localhost:5000/user/delete", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ document_id: fileId }),
            })

            await documentAPI.deleteDocument(fileId)
            console.log("Deleted file:", fileId)

            window.dispatchEvent(
              new CustomEvent("fileDeleted", {
                detail: { fileId },
              }),
            )
          } catch (error) {
            console.error("Error deleting file:", fileId, error)
          }
        }

        console.log(`Deleted ${filesToDelete.length} files from folder ${folderId}`)

        let updatedFolders: FolderType[] = []

        if (parentId) {
          updatedFolders = updateFolderContents(rootFolders, parentId, (folder) => ({
            ...folder,
            folders: folder.folders.filter((f) => f.id !== folderId),
          }))
          setRootFolders(updatedFolders)
        } else {
          updatedFolders = rootFolders.filter((f) => f.id !== folderId)
          setRootFolders(updatedFolders)
        }

        if (userID) {
          try {
            localStorage.setItem(
              `${FOLDERS_STORAGE_KEY}_${userID}`,
              JSON.stringify(parentId ? updatedFolders : updatedFolders),
            )
          } catch (error) {
            console.error("Error saving updated folders to localStorage:", error)
          }
        }
      } catch (error) {
        console.error("Error deleting folder:", error)
      }
    },
    [updateFolderContents, rootFolders, userID],
  )

  // Handles drag start event
  const handleDragStart = (
    e: React.DragEvent,
    item: FileItem | FolderType,
    type: "file" | "folder",
    parentId: string | null,
  ) => {
    e.stopPropagation()
    setDraggedItem({ type, item, parentId } as DragItem)
  }

  // Handles drag over event
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Handles drop event
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetFolderId?: string) => {
      e.preventDefault()
      e.stopPropagation()

      if (!draggedItem) return

      if (draggedItem.type === "folder" && isDescendant(draggedItem.item as FolderType, targetFolderId)) {
        return
      }

      if (draggedItem.parentId) {
        setRootFolders((prevFolders) => {
          return updateFolderContents(prevFolders, draggedItem.parentId!, (folder) => ({
            ...folder,
            files: folder.files.filter((f) => f.id !== draggedItem.item.id),
            folders: folder.folders.filter((f) => f.id !== draggedItem.item.id),
          }))
        })
      } else {
        if (draggedItem.type === "file") {
          setRootFiles((files) => files.filter((f) => f.id !== draggedItem.item.id))
        } else {
          setRootFolders((folders) => folders.filter((f) => f.id !== draggedItem.item.id))
        }
      }

      if (targetFolderId) {
        setRootFolders((prevFolders) => {
          return updateFolderContents(prevFolders, targetFolderId, (folder) => ({
            ...folder,
            files: draggedItem.type === "file" ? [...folder.files, draggedItem.item as FileItem] : folder.files,
            folders:
              draggedItem.type === "folder" ? [...folder.folders, draggedItem.item as FolderType] : folder.folders,
          }))
        })
      } else {
        if (draggedItem.type === "file") {
          setRootFiles((prev) => [...prev, draggedItem.item as FileItem])
        } else {
          setRootFolders((prev) => [...prev, draggedItem.item as FolderType])
        }
      }

      setDraggedItem(null)
    },
    [draggedItem, updateFolderContents],
  )

  // Checks if a folder is a descendant of another folder
  const isDescendant = (folder: FolderType, targetId?: string): boolean => {
    if (!targetId) return false
    if (folder.id === targetId) return true
    return folder.folders.some((f) => isDescendant(f, targetId))
  }

  // Renders a file item
  const renderFile = (file: FileItem, folderId?: string) => (
    <div
      key={file.id}
      className="flex items-center gap-2 hover:bg-gray-50 rounded-md p-1"
      draggable
      onDragStart={(e) => handleDragStart(e, file, "file", folderId || null)}
      title={getFullFilePath(file.id, folderId)}
    >
      <div className="w-4 h-4 flex items-center justify-center"></div>
      <Checkbox
        checked={file.selected}
        onCheckedChange={() => toggleFileSelection(file.id, folderId)}
        className="h-4 w-4"
      />
      <FileText className="w-4 h-4 text-gray-400" />
      <span className="text-sm truncate flex-grow">{file.name}</span>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation()
            deleteFile(file.id, folderId)
          }}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </div>
  )

  // Renders a folder item
  const renderFolder = (folder: FolderType, parentId: string | null = null, isSearchResult = false) => (
    <div
      key={folder.id}
      className="space-y-1"
      draggable
      onDragStart={(e) => handleDragStart(e, folder, "folder", parentId)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, folder.id)}
    >
      <div className="flex items-center gap-2 hover:bg-gray-50 rounded-md p-1" title={getFullFolderPath(folder.id)}>
        <button
          onClick={() => toggleFolder(folder.id)}
          className="text-gray-500 w-4 h-4 flex items-center justify-center"
        >
          {folder.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <Checkbox
          checked={folder.selected}
          onCheckedChange={() => toggleFolderSelection(folder.id)}
          className="h-4 w-4"
        />
        <Folder className="w-4 h-4 text-gray-400" />
        <span className="text-sm truncate flex-grow">{folder.name}</span>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white shadow-lg">
              <DropdownMenuItem className="cursor-pointer" onSelect={() => setShowNewFolderInput(folder.id)}>
                Add Subfolder
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(e) => {
                  e.stopPropagation() // Prevent event bubbling
                  const fileInput = document.getElementById(`file-upload-${folder.id}`)
                  if (fileInput) {
                    fileInput.click()
                  }
                }}
              >
                Add File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation() // Prevent event bubbling
              deleteFolder(folder.id, parentId || undefined)
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      <input
        id={`file-upload-${folder.id}`}
        type="file"
        className="hidden"
        multiple
        onChange={(e) => {
          if (e.target.files) {
            handleFileUpload(e, userID, folder.id)
            e.target.value = ""
          }
        }}
      />

      {(folder.expanded || isSearchResult) && (
        <div className="ml-6 space-y-1">
          {folder.folders.map((subFolder) => renderFolder(subFolder, folder.id, isSearchResult))}
          {folder.files.map((file) => renderFile(file, folder.id))}
        </div>
      )}
    </div>
  )

  // Updates selected files when selection changes
  useEffect(() => {
    const allSelectedFiles = [
      ...rootFiles.filter((file) => file.selected),
      ...rootFolders.flatMap((folder) => getAllSelectedFiles(folder)),
    ]
    onFileSelect(allSelectedFiles)
  }, [rootFiles, rootFolders, onFileSelect])

  // Gets all selected files from a folder recursively
  const getAllSelectedFiles = (folder: FolderType): FileItem[] => {
    return [
      ...folder.files.filter((file) => file.selected),
      ...folder.folders.flatMap((subFolder) => getAllSelectedFiles(subFolder)),
    ]
  }

  // Creates a new chat
  const createNewChat = () => {
    const newChatbox = {
      id: Math.random().toString(36).substr(2, 9),
      name: newChatName || "New Chatbox",
      messages: [],
    }
    setChatboxes((prevChatboxes) => [...prevChatboxes, newChatbox])
    setNewChatName("")
    setShowNewChatInput(false)
  }

  // Switches to a different chat
  const switchChatbox = (chatboxId: string) => {
    setCurrentChatId(chatboxId)
    const selectedChatbox = chatboxes.find((chatbox) => chatbox.id === chatboxId)
    if (selectedChatbox) {
      setChatHistory(selectedChatbox.messages)
    }
    console.log("Switched to chatbox:", chatboxId)
  }

  // Deletes a chat
  const deleteChatbox = (chatboxId: string) => {
    setChatboxes((prevChatboxes) => prevChatboxes.filter((chatbox) => chatbox.id !== chatboxId))
    console.log("Deleted chatbox:", chatboxId)
  }

  // Renders search results
  const renderSearchResults = () => {
    if (!searchResults) return null

    const { files, folders, chats } = searchResults
    const hasResults = files.length > 0 || folders.length > 0 || chats.length > 0

    if (!hasResults) {
      return <div className="p-4 text-center text-gray-500">No results found for "{searchQuery}"</div>
    }

    return (
      <div className="space-y-4">
        {chats.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Chats</h4>
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-center gap-2 hover:bg-gray-50 rounded-md p-1 cursor-pointer"
                  onClick={() => switchChatbox(chat.id)}
                >
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm truncate flex-grow">{chat.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {folders.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Folders</h4>
            <div className="space-y-1">{folders.map((folder) => renderFolder(folder, null, true))}</div>
          </div>
        )}

        {files.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Files</h4>
            <div className="space-y-1">{files.map((file) => renderFile(file))}</div>
          </div>
        )}
      </div>
    )
  }

  // Ensures folder structure changes are immediately saved to localStorage
  useEffect(() => {
    const saveToLocalStorage = () => {
      if (userID && rootFolders.length >= 0) {
        try {
          localStorage.setItem(`${FOLDERS_STORAGE_KEY}_${userID}`, JSON.stringify(rootFolders))
          console.log("Saved updated folder structure to localStorage")
        } catch (error) {
          console.error("Error saving folders to localStorage:", error)
        }
      }
    }

    saveToLocalStorage()
  }, [rootFolders, userID])

  return (
    <div className="file-collection-container w-64 border-r h-[calc(100vh-64px)] p-4 flex flex-col gap-3 bg-white text-black">
      <div className="flex items-center justify-between"></div>

      <div className="space-y-2">
        <div className="relative">
          <Input
            placeholder={t("searchAll")}
            className="h-8 text-sm pr-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch()
              }
            }}
          />
          {searchQuery && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="secondary"
          className="w-full h-8 text-sm bg-green-500 hover:bg-green-600 text-black"
          onClick={handleSearch}
        >
          <Search className="w-4 h-4 mr-2" />
          {t("searchInFiles")}
        </Button>
      </div>

      {searchResults ? (
        <div className="flex-1 overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Search Results</h3>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={clearSearch}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          {renderSearchResults()}
        </div>
      ) : (
        <>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-sm font-medium">{t("chat")}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Plus className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white shadow-lg">
                <DropdownMenuItem className="cursor-pointer" onSelect={() => setShowNewChatInput(true)}>
                  {t("createNewChat")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {showNewChatInput && (
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Chatbox name"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                className="h-8 text-sm"
              />
              <Button size="sm" className="h-8" onClick={() => createNewChat()}>
                {t("create")}
              </Button>
            </div>
          )}

          <div className="-mt-2 space-y-1 overflow-auto flex-1" style={{ maxHeight: "150px" }}>
            {chatboxes.map((chatbox) => (
              <div
                key={chatbox.id}
                className={`flex items-center gap-2 hover:bg-gray-50 rounded-md p-1 cursor-pointer ${
                  currentChatId === chatbox.id ? "bg-gray-200" : ""
                }`}
                onClick={() => switchChatbox(chatbox.id)}
              >
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <span className="text-sm truncate flex-grow">{chatbox.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteChatbox(chatbox.id)
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-2 flex-1 overflow-auto">
            <div className="flex items-center justify-between mb-2 sticky top-0 bg-white z-10">
              <h3 className="text-sm font-medium">{t("fileCollection")}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white shadow-lg">
                  <DropdownMenuItem className="cursor-pointer" onSelect={() => setShowNewFolderInput(true)}>
                    Add Folder
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => document.getElementById("root-file-upload")?.click()}
                  >
                    Add File
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {showNewFolderInput && (
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button
                  size="sm"
                  className="h-8"
                  onClick={() => createFolder(typeof showNewFolderInput === "string" ? showNewFolderInput : undefined)}
                >
                  {t("create")}
                </Button>
              </div>
            )}

            <div className="space-y-1" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e)}>
              {rootFolders.map((folder) => renderFolder(folder))}
              {rootFiles.map((file) => renderFile(file))}
            </div>
          </div>
        </>
      )}

      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">{t("quickUpload")}</h3>
        <div
          className="border-2 border-dashed rounded-lg p-4 text-center"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e)}
        >
          <p className="text-sm text-muted-foreground">{t("dropFileHere")}</p>
          <p className="text-sm text-muted-foreground"> - or - </p>
          <label className="cursor-pointer text-sm text-primary hover:underline">
            {t("clickToUpload")}
            <input
              id="root-file-upload"
              type="file"
              className="hidden"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  handleFileUpload(e, userID)
                  e.target.value = ""
                }
              }}
            />
          </label>
        </div>
      </div>
    </div>
  )
}

