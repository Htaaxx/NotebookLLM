"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
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

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

// Local storage key for folders
const FOLDERS_STORAGE_KEY = "userFolders"

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
  // Existing state and functions
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
  const [isSearching, setIsSearching] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [showNewFolderInput, setShowNewFolderInput] = useState<boolean | string>(false)
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [chatboxes, setChatboxes] = useState<ChatItem[]>([])
  const [showNewChatInput, setShowNewChatInput] = useState<boolean>(false)
  const [newChatName, setNewChatName] = useState("")
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<string[]>([])
  useEffect(() => {
  const handleFileDeleted = (event: CustomEvent) => {
    const deletedFileId = event.detail.fileId

    // Update root files
    setRootFiles((prevFiles: FileItem[]) => prevFiles.filter((file: FileItem) => file.id !== deletedFileId))

    // Update files in folders
    const updateFoldersRecursively = (folders: FolderType[]): FolderType[] => {
      return folders.map((folder) => ({
        ...folder,
        files: folder.files.filter((file) => file.id !== deletedFileId),
        folders: updateFoldersRecursively(folder.folders),
      }))
    }

    setRootFolders((prevFolders: FolderType[]) => updateFoldersRecursively(prevFolders))
  }

  // Add event listener
  window.addEventListener("fileDeleted", handleFileDeleted as EventListener)

  // Clean up
  return () => {
    window.removeEventListener("fileDeleted", handleFileDeleted as EventListener)
  }
}, [])

  // Helper function to determine file type from name
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

  const getFileExtension = (filename: string): string => {
    if (!filename) return ""

    // Get the last part after the dot
    const extensionMatch = filename.match(/\.[^.]+$/)

    // Return the extension with the dot, or empty string if no extension
    return extensionMatch ? extensionMatch[0].toLowerCase() : ""
  }

  // Function to get file path based on folder hierarchy
  const getFilePath = useCallback(
    (folderId?: string): string => {
      if (!folderId) {
        return "root"
      }

      // Helper function to find path to a specific folder
      const findFolderPath = (folders: FolderType[], targetId: string, currentPath = "root"): string | null => {
        for (const folder of folders) {
          if (folder.id === targetId) {
            return currentPath + "/" + folder.name
          }

          // Check in subfolders
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

  // Function to get full path for a file
  const getFullFilePath = useCallback(
    (fileId: string, folderId?: string): string => {
      if (!folderId) {
        // Root file
        const file = rootFiles.find((f) => f.id === fileId)
        return file ? file.name : "Unknown file"
      }

      // File in a folder
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

  // Function to get full path for a folder
  const getFullFolderPath = useCallback(
    (folderId: string): string => {
      return getFilePath(folderId).replace("root/", "")
    },
    [getFilePath],
  )

  // Save folders to localStorage whenever they change
  useEffect(() => {
    if (userID && rootFolders.length > 0) {
      try {
        localStorage.setItem(`${FOLDERS_STORAGE_KEY}_${userID}`, JSON.stringify(rootFolders))
      } catch (error) {
        console.error("Error saving folders to localStorage:", error)
      }
    }
  }, [rootFolders, userID])

  // Load folders from localStorage on component mount
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

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults(null)
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    // Search files and folders
    const fileResults = searchFiles(searchQuery, rootFiles, rootFolders)

    // Search chats
    const chatResults = searchChats(searchQuery, chatboxes)

    setSearchResults({
      files: fileResults.files,
      folders: fileResults.folders,
      chats: chatResults,
    })
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults(null)
    setIsSearching(false)
  }

  // Existing handleDisplayUserFiles function
  const handleDisplayUserFiles = useCallback(
    async (userId: string) => {
      try {
        // First, load folders from localStorage to ensure empty folders are preserved
        const storedFolders = loadFoldersFromStorage(userId)

        // Call the API to get all documents for this user
        console.log("Loading documents for user:", userId)
        const documents = await documentAPI.getDocuments(userId)

        // Start with empty root files
        const newRootFiles: FileItem[] = []

        // Use stored folders as a base, or empty array if none exist
        const newRootFolders: FolderType[] = storedFolders || []

        if (!documents || documents.length === 0) {
          console.log("No documents found for user")
          // Even if no documents, we still set the folders from localStorage
          setRootFolders(newRootFolders)
          return
        }

        console.log("Documents loaded:", documents.length)

        // Group documents by filepath to create folder structure
        const filesByPath: Record<string, any[]> = {}

        documents.forEach((doc: { document_id: string; document_name: string; document_path: string }) => {
          const path = doc.document_path || "root"

          // Check path validity
          console.log(`Document ${doc.document_id} has path: ${path}`)

          if (!filesByPath[path]) {
            filesByPath[path] = []
          }
          filesByPath[path].push(doc)
        })

        // Add files directly in the root
        if (filesByPath["root"]) {
          filesByPath["root"].forEach((doc) => {
            const cloudinaryURL = `https://res.cloudinary.com/df4dk9tjq/image/upload/v1743076103/${doc.document_id}${getFileExtension(doc.document_name)}`
            console.log("Cloudinary URL:", cloudinaryURL)

            // Determine file type based on name
            const fileType = doc.document_name ? getFileTypeFromName(doc.document_name) : "document"

            newRootFiles.push({
              id: doc.document_id,
              name: doc.document_name || "Untitled Document",
              selected: false,
              type: fileType,
              url: cloudinaryURL, // Set the URL for preview
              size: 0,
              cloudinaryId: doc.document_id,
              FilePath: "root",
            })
          })
        }

        // Helper function to find or create folder path
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

        // Process each path to create folder structure
        Object.keys(filesByPath).forEach((path) => {
          if (path === "root") return

          const pathParts = path.split("/").filter((p) => p !== "root")
          if (pathParts.length === 0) return

          const result = findOrCreateFolderPath(newRootFolders, pathParts)

          if (result) {
            const { folder } = result

            // Add files to the folder
            folder.files.push(
              ...filesByPath[path].map((doc) => {
                // Generate URL for Cloudinary resource
                const cloudinaryURL = `https://res.cloudinary.com/df4dk9tjq/image/upload/v1743076103/${doc.document_id}`

                // Determine file type based on name
                const fileType = doc.document_name ? getFileTypeFromName(doc.document_name) : "document"

                return {
                  id: doc.document_id,
                  name: doc.document_name || "Untitled Document",
                  selected: false,
                  type: fileType,
                  url: cloudinaryURL, // Set the URL for preview
                  size: 0,
                  cloudinaryId: doc.document_id,
                  FilePath: path,
                }
              }),
            )
          }
        })

        console.log("Setting state with files:", newRootFiles.length, "and folders:", newRootFolders.length)

        // Update the state
        setRootFiles(newRootFiles)
        setRootFolders(newRootFolders)
      } catch (error) {
        console.error("Error displaying user files:", error)
      }
    },
    [],
  )

  const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false)

  useEffect(() => {
    const storedUserID = localStorage.getItem("user_id")
    if (storedUserID && !hasFetchedInitialData) {
      setUserID(storedUserID)
      handleDisplayUserFiles(storedUserID)
      setHasFetchedInitialData(true)
    }
  }, [handleDisplayUserFiles, hasFetchedInitialData])


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

            // Create FormData for file upload
            const formData = new FormData()
            formData.append("file", file)
            formData.append("document_id", documentId)

            const uploadResponse = await fetch("http://localhost:5000/user/upload", {
              method: "POST",
              body: formData,
            })

            if (!uploadResponse.ok) {
              throw new Error(`Upload failed: ${uploadResponse.status}`)
            }

            const data = await uploadResponse.json()

            return {
              id: documentId,
              name: file.name,
              selected: false,
              type: file.type,
              url: data.url || `https://res.cloudinary.com/df4dk9tjq/image/upload/v1743076103/${documentId}`,
              size: file.size,
              cloudinaryId: documentId,
              FilePath: response.document_path || filePath,
            }
          } catch (error) {
            console.error("Error uploading file:", error)
            return null
          }
        })

        // Wait for all uploads to complete
        const uploadedFiles = await Promise.all(uploadPromises)
        const validUploadedFiles = uploadedFiles.filter(Boolean) as FileItem[]

        // Update UI state
        if (folderId) {
          setRootFolders((prevFolders) =>
            updateFolderContents(prevFolders, folderId, (folder) => ({
              ...folder,
              files: [...folder.files, ...validUploadedFiles],
            })),
          )
        } else {
          setRootFiles((prev) => [...prev, ...validUploadedFiles])
        }
      } catch (error) {
        console.error("Error during file uploads:", error)
      }
    },
    [getFilePath, updateFolderContents],
  )

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

  // Updated to handle search results
  const toggleFolderSelection = useCallback(
    (folderId: string) => {
      // First check if we're in search mode
      if (isSearching && searchResults) {
        // Find the folder in search results
        const folderInSearch = findFolderById(searchResults.folders, folderId)

        if (folderInSearch) {
          // Update the folder in search results
          const updatedFolders = updateFolderInSearchResults(searchResults.folders, folderId, !folderInSearch.selected)

          setSearchResults({
            ...searchResults,
            folders: updatedFolders,
          })
        }
      }

      // Always update the main data structure
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
    [updateFolderContents, isSearching, searchResults],
  )

  // Helper function to find a folder by ID
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

  // Helper function to update a folder in search results
  const updateFolderInSearchResults = (folders: FolderType[], folderId: string, selected: boolean): FolderType[] => {
    return folders.map((folder) => {
      if (folder.id === folderId) {
        return {
          ...folder,
          selected,
          files: folder.files.map((file) => ({ ...file, selected })),
          folders: folder.folders.map((subFolder) => ({ ...subFolder, selected })),
        }
      }

      return {
        ...folder,
        folders: updateFolderInSearchResults(folder.folders, folderId, selected),
      }
    })
  }

  // Updated to handle search results
  const toggleFileSelection = useCallback(
    (fileId: string, folderId?: string) => {
      // First check if we're in search mode
      if (isSearching && searchResults) {
        // Update the file in search results
        const updatedFiles = searchResults.files.map((file) =>
          file.id === fileId ? { ...file, selected: !file.selected } : file,
        )

        setSearchResults({
          ...searchResults,
          files: updatedFiles,
        })

        // Now update the actual file in the main data structure
        // First check if it's in root files
        const rootFile = rootFiles.find((file) => file.id === fileId)
        if (rootFile) {
          setRootFiles((files) =>
            files.map((file) => (file.id === fileId ? { ...file, selected: !file.selected } : file)),
          )
        } else {
          // If not in root, it must be in a folder
          // We need to find which folder contains this file
          const updateFolderWithFile = (folders: FolderType[]): FolderType[] => {
            return folders.map((folder) => {
              // Check if file is in this folder
              const fileIndex = folder.files.findIndex((file) => file.id === fileId)
              if (fileIndex >= 0) {
                // File found in this folder
                const updatedFiles = [...folder.files]
                updatedFiles[fileIndex] = {
                  ...updatedFiles[fileIndex],
                  selected: !updatedFiles[fileIndex].selected,
                }
                return { ...folder, files: updatedFiles }
              }

              // If not in this folder, check subfolders
              return {
                ...folder,
                folders: updateFolderWithFile(folder.folders),
              }
            })
          }

          setRootFolders((folders) => updateFolderWithFile(folders))
        }
      } else {
        // Original behavior for non-search mode
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
      }
    },
    [updateFolderContents, isSearching, searchResults, rootFiles],
  )

  // Fixed deleteFile function to not delete folders
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

        // Update UI state - only remove the file, not the folder
        if (folderId) {
          setRootFolders((prevFolders) =>
            updateFolderContents(prevFolders, folderId, (folder) => ({
              ...folder,
              files: folder.files.filter((file) => file.id !== fileId),
            })),
          )
        } else {
          setRootFiles((files) => files.filter((file) => file.id !== fileId))
        }

        // Also remove from search results if present
        if (searchResults) {
          setSearchResults({
            ...searchResults,
            files: searchResults.files.filter((file) => file.id !== fileId),
          })
        }
      } catch (error) {
        console.error("Error deleting file:", error)
      }
    },
    [updateFolderContents, searchResults],
  )

  // Find the deleteFolder function and replace it with this improved version that recursively deletes all files
  const deleteFolder = useCallback(
    async (folderId: string, parentId?: string) => {
      try {
        // First, collect all file IDs within this folder and its subfolders
        const folderToDelete = findFolderById(rootFolders, folderId)
        if (!folderToDelete) {
          console.error("Folder not found:", folderId)
          return
        }

        // Recursively collect all file IDs in the folder and its subfolders
        const filesToDelete: string[] = []
        const collectFilesRecursively = (folder: FolderType) => {
          // Add files directly in this folder
          folder.files.forEach((file) => filesToDelete.push(file.id))

          // Process subfolders
          folder.folders.forEach((subfolder) => collectFilesRecursively(subfolder))
        }

        collectFilesRecursively(folderToDelete)

        // Delete all files from storage and database
        for (const fileId of filesToDelete) {
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
            console.log("Deleted file:", fileId)
          } catch (error) {
            console.error("Error deleting file:", fileId, error)
          }
        }

        console.log(`Deleted ${filesToDelete.length} files from folder ${folderId}`)

        // Now remove the folder from UI state
        if (parentId) {
          setRootFolders((prevFolders) => {
            return updateFolderContents(prevFolders, parentId, (folder) => ({
              ...folder,
              folders: folder.folders.filter((f) => f.id !== folderId),
            }))
          })
        } else {
          setRootFolders((folders) => folders.filter((f) => f.id !== folderId))
        }

        // Also remove from search results if present
        if (searchResults) {
          setSearchResults({
            ...searchResults,
            folders: searchResults.folders.filter((folder) => folder.id !== folderId),
          })
        }
      } catch (error) {
        console.error("Error deleting folder:", error)
      }
    },
    [updateFolderContents, searchResults, rootFolders],
  )

  const handleDragStart = (
    e: React.DragEvent,
    item: FileItem | FolderType,
    type: "file" | "folder",
    parentId: string | null,
  ) => {
    e.stopPropagation()
    setDraggedItem({ type, item, parentId } as DragItem)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetFolderId?: string) => {
      e.preventDefault()
      e.stopPropagation()

      if (!draggedItem) return

      // Prevent dropping a folder into itself or its descendants
      if (draggedItem.type === "folder" && isDescendant(draggedItem.item as FolderType, targetFolderId)) {
        return
      }

      // Remove from source
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

      // Add to target
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
        // Drop to root level
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

  const isDescendant = (folder: FolderType, targetId?: string): boolean => {
    if (!targetId) return false
    if (folder.id === targetId) return true
    return folder.folders.some((f) => isDescendant(f, targetId))
  }

  // New function to render a file with file icon - consistent spacing and tooltip
  const renderFile = (file: FileItem, folderId?: string) => (
    <div
      key={file.id}
      className="flex items-center gap-2 hover:bg-gray-50 rounded-md p-1"
      draggable
      onDragStart={(e) => handleDragStart(e, file, "file", folderId || null)}
      title={getFullFilePath(file.id, folderId)}
    >
      <div className="w-4 h-4 flex items-center justify-center">{/* Consistent spacer for all files */}</div>
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
            e.stopPropagation() // Prevent event bubbling
            deleteFile(file.id, folderId)
          }}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </div>
  )

  // Render folder function - updated with consistent folder icon and tooltip
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

      {/* Always render the file input, but only show folder content when expanded or in search results */}
      <input
        id={`file-upload-${folder.id}`}
        type="file"
        className="hidden"
        multiple
        onChange={(e) => {
          if (e.target.files) {
            handleFileUpload(e, userID, folder.id)
            // Reset the input to allow uploading the same file again
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

  useEffect(() => {
    const allSelectedFiles = [
      ...rootFiles.filter((file) => file.selected),
      ...rootFolders.flatMap((folder) => getAllSelectedFiles(folder)),
    ]
    onFileSelect(allSelectedFiles) // Pass the full array
  }, [rootFiles, rootFolders, onFileSelect])

  const getAllSelectedFiles = (folder: FolderType): FileItem[] => {
    return [
      ...folder.files.filter((file) => file.selected),
      ...folder.folders.flatMap((subFolder) => getAllSelectedFiles(subFolder)),
    ]
  }

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

  const switchChatbox = (chatboxId: string) => {
    setCurrentChatId(chatboxId)
    const selectedChatbox = chatboxes.find((chatbox) => chatbox.id === chatboxId)
    if (selectedChatbox) {
      setChatHistory(selectedChatbox.messages)
    }
    console.log("Switched to chatbox:", chatboxId)
  }

  const deleteChatbox = (chatboxId: string) => {
    setChatboxes((prevChatboxes) => prevChatboxes.filter((chatbox) => chatbox.id !== chatboxId))
    console.log("Deleted chatbox:", chatboxId)
  }

  // Render search results
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

      {/* Search Results */}
      {isSearching ? (
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

          {/* Chat boxes section */}
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
                    e.stopPropagation() // Prevent event bubbling
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

            {/* File and folder list */}
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
                  // Reset the input to allow uploading the same file again
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







