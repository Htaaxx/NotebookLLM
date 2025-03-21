"use client"

import { useState } from "react"
import { NavBar } from "@/components/nav-bar"
import { Upload, FileText, Youtube } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function FilesPage() {
  const [dragActive, setDragActive] = useState(false)
  const [text, setText] = useState("")

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle the files
      console.log(e.dataTransfer.files)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Upload Area */}
          <Card>
            <CardContent className="p-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  dragActive ? "border-primary bg-primary/5" : "border-gray-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-10 h-10 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold mb-2">Upload Files</h2>
                <p className="text-gray-500 mb-4">
                  Drag and drop or{" "}
                  <label className="text-primary hover:underline cursor-pointer">
                    choose files
                    <input type="file" className="hidden" multiple />
                  </label>{" "}
                  to upload
                </p>
                <p className="text-sm text-gray-400">Supported files: PDF, txt, Markdown, Audio files (e.g., mp3)</p>
              </div>
            </CardContent>
          </Card>

          {/* Integration Options */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Google Drive */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <FileText className="w-8 h-8 mx-auto mb-4 text-blue-500" />
                  <h3 className="font-semibold mb-2">Google Drive</h3>
                  <Button variant="outline" className="w-full">
                    Import from Drive
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* YouTube */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Youtube className="w-8 h-8 mx-auto mb-4 text-red-500" />
                  <h3 className="font-semibold mb-2">YouTube</h3>
                  <Button variant="outline" className="w-full">
                    Import from YouTube
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Text Input */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Copy and Paste Text</h3>
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste your text here (up to 1000 words)"
                  className="min-h-[200px]"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">{text.split(/\s+/).filter(Boolean).length} / 1000 words</p>
                  <Button>Save Text</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

