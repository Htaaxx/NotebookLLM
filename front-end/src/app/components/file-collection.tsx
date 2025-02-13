"use client"

import { useState } from "react"
import { Search, FolderPlus, ChevronRight, ChevronDown, File, Trash2 } from "lucide-react"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"

interface FileItem {
  id: string
  name: string
  selected: boolean
}

interface Folder {
  id: string
  name: string
  files: FileItem[]
  selected: boolean
  expanded: boolean
}

export function FileCollection() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, folderId?: string) => {
    const uploadedFiles = event.target.files
    if (uploadedFiles) {
      const newFiles = Array.from(uploadedFiles).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        selected: false,
      }))

      if (folderId) {
        setFolders(
          folders.map((folder) =>
            folder.id === folderId ? { ...folder, files: [...folder.files, ...newFiles] } : folder,
          ),
        )
      } else {
        setFiles((prev) => [...prev, ...newFiles])
      }
    }
  }

  const createFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: Folder = {
        id: Math.random().toString(36).substr(2, 9),
        name: newFolderName,
        files: [],
        selected: false,
        expanded: false,
      }
      setFolders([...folders, newFolder])
      setNewFolderName("")
      setShowNewFolderInput(false)
    }
  }

  const toggleFolder = (folderId: string) => {
    setFolders(folders.map((folder) => (folder.id === folderId ? { ...folder, expanded: !folder.expanded } : folder)))
  }

  const toggleFolderSelection = (folderId: string) => {
    setFolders(
      folders.map((folder) =>
        folder.id === folderId
          ? {
              ...folder,
              selected: !folder.selected,
              files: folder.files.map((file) => ({ ...file, selected: !folder.selected })),
            }
          : folder,
      ),
    )
  }

  const toggleFileSelection = (fileId: string, folderId?: string) => {
    if (folderId) {
      setFolders(
        folders.map((folder) =>
          folder.id === folderId
            ? {
                ...folder,
                files: folder.files.map((file) => (file.id === fileId ? { ...file, selected: !file.selected } : file)),
                selected: false, // Unselect folder when individual file selection changes
              }
            : folder,
        ),
      )
    } else {
      setFiles(files.map((file) => (file.id === fileId ? { ...file, selected: !file.selected } : file)))
    }
  }

  const deleteFile = (fileId: string, folderId?: string) => {
    if (folderId) {
      setFolders(
        folders.map((folder) =>
          folder.id === folderId ? { ...folder, files: folder.files.filter((file) => file.id !== fileId) } : folder,
        ),
      )
    } else {
      setFiles(files.filter((file) => file.id !== fileId))
    }
  }

  const deleteFolder = (folderId: string) => {
    setFolders(folders.filter((folder) => folder.id !== folderId))
  }

  return (
    <div className="w-64 border-r h-[calc(100vh-64px)] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">File Collection</h2>
        <button className="text-gray-400 hover:text-gray-600">
          <span className="sr-only">Information</span>ⓘ
        </button>
      </div>

      <div className="space-y-2">
        <Input
          placeholder="Search All"
          className="h-8 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="secondary" className="w-full h-8 text-sm bg-green-500 hover:bg-green-600 text-white">
          <Search className="w-4 h-4 mr-2" />
          Search in File(s)
        </Button>
      </div>

      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Public File Collection</h3>
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setShowNewFolderInput(true)}>
            <FolderPlus className="w-4 h-4" />
          </Button>
        </div>

        {showNewFolderInput && (
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="h-8 text-sm"
            />
            <Button size="sm" className="h-8" onClick={createFolder}>
              Create
            </Button>
          </div>
        )}

        <div className="space-y-1">
          {folders.map((folder) => (
            <div key={folder.id} className="space-y-1">
              <div className="flex items-center gap-2 hover:bg-gray-50 rounded-md p-1">
                <button onClick={() => toggleFolder(folder.id)} className="text-gray-500">
                  {folder.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <Checkbox checked={folder.selected} onCheckedChange={() => toggleFolderSelection(folder.id)} />
                <span className="text-sm truncate flex-grow">{folder.name}</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => deleteFolder(folder.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>

              {folder.expanded && (
                <div className="ml-6 space-y-1">
                  {folder.files.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 hover:bg-gray-50 rounded-md p-1">
                      <File className="w-4 h-4 text-gray-400" />
                      <Checkbox
                        checked={file.selected}
                        onCheckedChange={() => toggleFileSelection(file.id, folder.id)}
                      />
                      <span className="text-sm truncate flex-grow">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => deleteFile(file.id, folder.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <label className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer p-1">
                    <input type="file" className="hidden" multiple onChange={(e) => handleFileUpload(e, folder.id)} />
                    Add files to folder
                  </label>
                </div>
              )}
            </div>
          ))}

          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-2 hover:bg-gray-50 rounded-md p-1">
              <File className="w-4 h-4 text-gray-400" />
              <Checkbox checked={file.selected} onCheckedChange={() => toggleFileSelection(file.id)} />
              <span className="text-sm truncate flex-grow">{file.name}</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => deleteFile(file.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <h3 className="text-sm font-medium mb-2">Quick Upload</h3>
        <div className="border-2 border-dashed rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">Drop File Here</p>
          <p className="text-sm text-muted-foreground">- or -</p>
          <label className="cursor-pointer text-sm text-primary hover:underline">
            Click to Upload
            <input type="file" className="hidden" multiple onChange={(e) => handleFileUpload(e)} />
          </label>
        </div>
      </div>
    </div>
  )
}