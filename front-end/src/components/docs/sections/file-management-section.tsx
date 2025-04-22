"use client"

import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"
import { Upload, FolderPlus, FileText, Trash2, Search } from "lucide-react"

export function FileManagementSection() {
  return (
    <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeIn("up", 0.1)}>
        <h1 className="text-3xl font-bold mb-4">File Management</h1>
        <p className="text-lg text-gray-700 mb-6">
          Learn how to upload, organize, and manage your documents in NoteUS.
        </p>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.2)}>
        <h2 className="text-xl font-semibold mb-4">Uploading Documents</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              NoteUS supports various file formats including PDFs, Word documents, text files, and images.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Upload className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium">Method 1: Drag and Drop</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Simply drag files from your computer and drop them into the File Collection area.
                </p>
                <img
                  src="/placeholder.svg?height=150&width=250"
                  alt="Drag and Drop Files"
                  className="rounded-lg border w-full"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Upload className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium">Method 2: Upload Button</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Click the "+" button in the File Collection sidebar and select files from your computer.
                </p>
                <img
                  src="/placeholder.svg?height=150&width=250"
                  alt="Upload Button"
                  className="rounded-lg border w-full"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium flex items-center mb-2">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                Supported File Types
              </h4>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  PDF (.pdf)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Word (.docx, .doc)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Text (.txt)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Images (.jpg, .png)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Markdown (.md)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  CSV (.csv)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.3)}>
        <h2 className="text-xl font-semibold mb-4">Organizing Files with Folders</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 mb-4">Keep your documents organized by creating folders and subfolders.</p>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <FolderPlus className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium">Creating Folders</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Click the "+" button in the File Collection sidebar and select "Add Folder".
                </p>
                <img
                  src="/placeholder.svg?height=150&width=400"
                  alt="Creating Folders"
                  className="rounded-lg border w-full"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <FolderPlus className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium">Creating Subfolders</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Right-click on an existing folder and select "Add Subfolder".
                </p>
                <img
                  src="/placeholder.svg?height=150&width=400"
                  alt="Creating Subfolders"
                  className="rounded-lg border w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.4)}>
        <h2 className="text-xl font-semibold mb-4">Managing Files</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Search className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium">Searching for Files</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Use the search bar at the top of the File Collection sidebar to quickly find documents.
                </p>
                <img
                  src="/placeholder.svg?height=150&width=250"
                  alt="Searching for Files"
                  className="rounded-lg border w-full"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Trash2 className="w-5 h-5 text-red-600 mr-2" />
                  <h4 className="font-medium">Deleting Files</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Click the trash icon next to a file or right-click and select "Delete".
                </p>
                <img
                  src="/placeholder.svg?height=150&width=250"
                  alt="Deleting Files"
                  className="rounded-lg border w-full"
                />
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h4 className="font-medium mb-2 text-yellow-800">Important Notes</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>Deleted files cannot be recovered, so be careful when deleting documents.</li>
                <li>You can select multiple files by holding Ctrl (or Cmd on Mac) while clicking.</li>
                <li>Drag and drop files between folders to move them.</li>
                <li>The maximum file size for uploads is 10MB for free accounts and 50MB for premium accounts.</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.5)}>
        <h2 className="text-xl font-semibold mb-4">File Processing</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              When you upload a file, NoteUS processes it to extract text and prepare it for AI analysis.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-2">Processing Status</h4>
              <p className="text-sm text-gray-600 mb-3">
                You'll see a processing indicator when a file is being analyzed. This may take a few moments depending
                on the file size and complexity.
              </p>
              <img
                src="/placeholder.svg?height=100&width=400"
                alt="File Processing Status"
                className="rounded-lg border w-full"
              />
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h4 className="font-medium mb-2 text-green-800">Tips for Faster Processing</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>Use clear, well-formatted documents for best results.</li>
                <li>For PDFs, ensure they contain selectable text rather than scanned images.</li>
                <li>Break large documents into smaller, more focused files for faster processing.</li>
                <li>Premium accounts have priority processing for faster results.</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
