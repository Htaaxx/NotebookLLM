"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { Search, ChevronRight, ChevronDown, File, Trash2, Plus, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface FileItem {
  id: string
  name: string
  selected: boolean
  type: string
  url: string
  size: number
}

interface Folder {
  id: string
  name: string
  files: FileItem[]
  folders: Folder[]
  selected: boolean
  expanded: boolean
}

type DragItem =
  | {
      type: "file"
      item: FileItem
      parentId: string | null
    }
  | {
      type: "folder"
      item: Folder
      parentId: string | null
    }

interface FileCollectionProps {
  onFileSelect: (files: FileItem[]) => void;
}

interface ChatItem {
  id: string;
  name: string;
  messages: string[];
}

export function FileCollection({ onFileSelect }: FileCollectionProps) {
  const [rootFiles, setRootFiles] = useState<FileItem[]>([])
  const [rootFolders, setRootFolders] = useState<Folder[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [showNewFolderInput, setShowNewFolderInput] = useState<boolean | string>(false)
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [chatboxes, setChatboxes] = useState<ChatItem[]>([])
  const [showNewChatInput, setShowNewChatInput] = useState<boolean>(false)
  const [newChatName, setNewChatName] = useState("")
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<string[]>([])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>, folderId?: string) => {
    const uploadedFiles = event.target.files
    if (uploadedFiles) {
      const newFiles = Array.from(uploadedFiles).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        selected: false,
        type: file.type,
        url: URL.createObjectURL(file),
        size: file.size,
      }))

      if (folderId) {
        setRootFolders((prevFolders) => {
          return updateFolderContents(prevFolders, folderId, (folder) => ({
            ...folder,
            files: [...folder.files, ...newFiles],
          }))
        })
      } else {
        setRootFiles((prev) => [...prev, ...newFiles])
      }
    }
  }, [])

  const createFolder = useCallback(
    (parentId?: string) => {
      if (newFolderName.trim()) {
        const newFolder: Folder = {
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
    [newFolderName],
  )

  const updateFolderContents = useCallback(
    (folders: Folder[], folderId: string, updateFn: (folder: Folder) => Folder): Folder[] => {
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

  const toggleFolderSelection = useCallback(
    (folderId: string) => {
      setRootFolders((prevFolders) => {
        return updateFolderContents(prevFolders, folderId, (folder) => ({
          ...folder,
          selected: !folder.selected,
          files: folder.files.map((file) => ({ ...file, selected: !folder.selected })),
          folders: folder.folders.map((subFolder) => ({ ...subFolder, selected: !folder.selected })),
        }))
      })
    },
    [updateFolderContents],
  )

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

  const deleteFile = useCallback(
    (fileId: string, folderId?: string) => {
      if (folderId) {
        setRootFolders((prevFolders) => {
          return updateFolderContents(prevFolders, folderId, (folder) => ({
            ...folder,
            files: folder.files.filter((file) => file.id !== fileId),
          }))
        })
      } else {
        setRootFiles((files) => files.filter((file) => file.id !== fileId))
      }
    },
    [updateFolderContents],
  )

  const deleteFolder = useCallback(
    (folderId: string, parentId?: string) => {
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
    },
    [updateFolderContents],
  )

  const handleDragStart = (
    e: React.DragEvent,
    item: FileItem | Folder,
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
      if (draggedItem.type === "folder" && isDescendant(draggedItem.item as Folder, targetFolderId)) {
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
            folders: draggedItem.type === "folder" ? [...folder.folders, draggedItem.item as Folder] : folder.folders,
          }))
        })
      } else {
        // Drop to root level
        if (draggedItem.type === "file") {
          setRootFiles((prev) => [...prev, draggedItem.item as FileItem])
        } else {
          setRootFolders((prev) => [...prev, draggedItem.item as Folder])
        }
      }

      setDraggedItem(null)
    },
    [draggedItem, updateFolderContents],
  )

  const isDescendant = (folder: Folder, targetId?: string): boolean => {
    if (!targetId) return false
    if (folder.id === targetId) return true
    return folder.folders.some((f) => isDescendant(f, targetId))
  }

  const renderFolder = (folder: Folder, parentId: string | null = null) => (
    <div
      key={folder.id}
      className="space-y-1"
      draggable
      onDragStart={(e) => handleDragStart(e, folder, "folder", parentId)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, folder.id)}
    >
      <div className="flex items-center gap-2 hover:bg-gray-50 rounded-md p-1">
        <button onClick={() => toggleFolder(folder.id)} className="text-gray-500">
          {folder.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <Checkbox checked={folder.selected} onCheckedChange={() => toggleFolderSelection(folder.id)} />
        <span className="text-sm truncate flex-grow">{folder.name}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-background">
            <DropdownMenuItem onSelect={() => setShowNewFolderInput(folder.id)}>Add Subfolder</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => document.getElementById(`file-upload-${folder.id}`)?.click()}>
              Add File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => deleteFolder(folder.id, parentId || undefined)}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>

      {folder.expanded && (
        <div className="ml-6 space-y-1">
          {folder.folders.map((subFolder) => renderFolder(subFolder, folder.id))}
          {folder.files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-md p-1"
              draggable
              onDragStart={(e) => handleDragStart(e, file, "file", folder.id)}
            >
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <Checkbox checked={file.selected} onCheckedChange={() => toggleFileSelection(file.id, folder.id)} />
              <span className="text-sm truncate flex-grow">{file.name}</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => deleteFile(file.id, folder.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
          <input
            id={`file-upload-${folder.id}`}
            type="file"
            className="hidden"
            multiple
            onChange={(e) => handleFileUpload(e, folder.id)}
          />
        </div>
      )}
    </div>
  )

  useEffect(() => {
    const allSelectedFiles = [
      ...rootFiles.filter((file) => file.selected),
      ...rootFolders.flatMap((folder) => getAllSelectedFiles(folder)),
    ];
    onFileSelect(allSelectedFiles); // Pass the full array
  }, [rootFiles, rootFolders, onFileSelect]);

  const getAllSelectedFiles = (folder: Folder): FileItem[] => {
    return [
      ...folder.files.filter((file) => file.selected),
      ...folder.folders.flatMap((subFolder) => getAllSelectedFiles(subFolder)),
    ]
  }

  const createNewChat = () => {
    const newChatbox = {
      id: Math.random().toString(36).substr(2, 9),
      name: newChatName || 'New Chatbox',
      messages: [],
    }
    setChatboxes((prevChatboxes) => [...prevChatboxes, newChatbox])
    setNewChatName("")
    setShowNewChatInput(false)
  }

  const switchChatbox = (chatboxId: string) => {
    setCurrentChatId(chatboxId)
    const selectedChatbox = chatboxes.find(chatbox => chatbox.id === chatboxId)
    if (selectedChatbox) {
      setChatHistory(selectedChatbox.messages)
    }
    console.log('Switched to chatbox:', chatboxId)
  }

  const deleteChatbox = (chatboxId: string) => {
    setChatboxes((prevChatboxes) => prevChatboxes.filter(chatbox => chatbox.id !== chatboxId))
    console.log('Deleted chatbox:', chatboxId)
  }

  return (
    <div className="w-64 border-r h-[calc(100vh-64px)] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
      </div>

      <div className="space-y-2">
        <Input
          placeholder="Search All"
          className="h-8 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="secondary" className="w-full h-8 text-sm bg-green-500 hover:bg-green-500 text-black">
          <Search className="w-4 h-4 mr-2" />
          Search in File(s)
        </Button>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">Chat</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Plus className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-background bg-white">
            <DropdownMenuItem onSelect={() => setShowNewChatInput(true)}>Create New Chat</DropdownMenuItem>
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
          <Button
            size="sm"
            className="h-8"
            onClick={() => createNewChat()}
          >
            Create
          </Button>
        </div>
      )}

      <div className="-mt-2 space-y-1 overflow-auto flex-1" style={{ maxHeight: '150px' }}>
        {chatboxes.map((chatbox) => (
          <div
            key={chatbox.id}
            className={`flex items-center gap-2 hover:bg-gray-50 rounded-md p-1 cursor-pointer ${currentChatId === chatbox.id ? 'bg-gray-200' : ''}`}
            onClick={() => switchChatbox(chatbox.id)}
          >
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span className="text-sm truncate flex-grow">{chatbox.name}</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => deleteChatbox(chatbox.id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-2 flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-2 sticky top-0 bg-white z-10">
          <h3 className="text-sm font-medium">File Collection</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Plus className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background bg-white">
              <DropdownMenuItem onSelect={() => setShowNewFolderInput(true)}>Add Folder</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => document.getElementById("root-file-upload")?.click()}>
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
              Create
            </Button>
          </div>
        )}

        <div className="space-y-1" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e)}>
          {rootFolders.map((folder) => renderFolder(folder))}
          {rootFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-md p-1"
              draggable
              onDragStart={(e) => handleDragStart(e, file, "file", null)}
            >
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <Checkbox checked={file.selected} onCheckedChange={() => toggleFileSelection(file.id)} />
              <span className="text-sm truncate flex-grow">{file.name}</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => deleteFile(file.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Quick Upload</h3>
        <div
          className="border-2 border-dashed rounded-lg p-4 text-center"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e)}
        >
          <p className="text-sm text-muted-foreground">Drop File Here</p>
          <p className="text-sm text-muted-foreground">- or -</p>
          <label className="cursor-pointer text-sm text-primary hover:underline">
            Click to Upload
            <input
              id="root-file-upload"
              type="file"
              className="hidden"
              multiple
              onChange={(e) => handleFileUpload(e)}
            />
          </label>
        </div>
      </div>
    </div>
  )
}

