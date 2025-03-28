import type { FileItem, Folder, ChatItem } from "../types/app-types"

// Helper function to search through files
export function searchFiles(
  query: string,
  rootFiles: FileItem[],
  rootFolders: Folder[],
): { files: FileItem[]; folders: Folder[] } {
  if (!query.trim()) {
    return { files: [], folders: [] }
  }

  const normalizedQuery = query.toLowerCase().trim()

  // Search through root files
  const matchedFiles = rootFiles.filter((file) => file.name.toLowerCase().includes(normalizedQuery))

  // Search through folders and their files
  const matchedFoldersAndFiles = searchFoldersRecursive(normalizedQuery, rootFolders)

  // Create a map of all matched files to avoid duplicates
  const allMatchedFiles = [...matchedFiles]

  // Add files from folders but avoid duplicates
  matchedFoldersAndFiles.files.forEach((file) => {
    if (!allMatchedFiles.some((f) => f.id === file.id)) {
      allMatchedFiles.push(file)
    }
  })

  return {
    files: allMatchedFiles,
    folders: matchedFoldersAndFiles.folders,
  }
}

// Helper function to search through chats
export function searchChats(query: string, chatboxes: ChatItem[]): ChatItem[] {
  if (!query.trim()) {
    return []
  }

  const normalizedQuery = query.toLowerCase().trim()

  return chatboxes.filter((chat) => {
    // Search in chat name
    if (chat.name.toLowerCase().includes(normalizedQuery)) {
      return true
    }

    // Search in chat messages
    return chat.messages.some((message) => message.toLowerCase().includes(normalizedQuery))
  })
}

// Recursive function to search through folders
function searchFoldersRecursive(query: string, folders: Folder[]): { files: FileItem[]; folders: Folder[] } {
  const matchedFiles: FileItem[] = []
  const matchedFolders: Folder[] = []

  folders.forEach((folder) => {
    // Check if folder name matches
    const folderMatches = folder.name.toLowerCase().includes(query)

    // Check files in this folder
    const filesInFolder = folder.files.filter((file) => file.name.toLowerCase().includes(query))

    // Add matching files to results
    matchedFiles.push(...filesInFolder)

    // Recursively search subfolders
    const subResults = searchFoldersRecursive(query, folder.folders)

    // Add files from subfolders
    matchedFiles.push(...subResults.files)

    // Create a copy of the folder with only matching content
    if (folderMatches || filesInFolder.length > 0 || subResults.folders.length > 0) {
      // Create a deep copy of the folder with only matching content
      const folderCopy = { ...folder }

      // Only include matching files
      folderCopy.files = folder.files.filter((file) => file.name.toLowerCase().includes(query))

      // Only include matching subfolders or subfolders with matching content
      folderCopy.folders = subResults.folders

      // Add to matched folders
      matchedFolders.push(folderCopy)
    }
  })

  return { files: matchedFiles, folders: matchedFolders }
}

