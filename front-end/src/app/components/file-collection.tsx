"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"

interface FileItem {
  id: string
  name: string
  selected: boolean
}

export function FileCollection() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (uploadedFiles) {
      const newFiles = Array.from(uploadedFiles).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        selected: false,
      }))
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const toggleFileSelection = (id: string) => {
    setFiles(files.map((file) => (file.id === id ? { ...file, selected: !file.selected } : file)))
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
        <Input placeholder="Search All" className="h-8 text-sm" />
        <Button variant="secondary" className="w-full h-8 text-sm bg-green-500 hover:bg-green-600 text-white">
          <Search className="w-4 h-4 mr-2" />
          Search in File(s)
        </Button>
      </div>

      <div className="mt-2">
        <h3 className="text-sm font-medium mb-2">Public File Collection</h3>
        <div className="flex gap-2">
          <Input placeholder="Search All" className="h-8 text-sm flex-1" />
          <Input placeholder="Search in File" className="h-8 text-sm flex-1" />
        </div>
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between group hover:bg-gray-50 rounded-md p-2">
              <span className="text-sm truncate">{file.name}</span>
              <Checkbox
                checked={file.selected}
                onCheckedChange={() => toggleFileSelection(file.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
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
            <input type="file" className="hidden" multiple onChange={handleFileUpload} />
          </label>
        </div>
      </div>
    </div>
  )
}
