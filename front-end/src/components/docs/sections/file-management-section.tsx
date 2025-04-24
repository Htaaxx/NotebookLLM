"use client"

import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"
import { Upload, FolderPlus, FileText, Trash2, Search } from "lucide-react"
import { Anton } from "next/font/google"

// Initialize Anton font
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export function FileManagementSection() {
  return (
    <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" animate="show" className="space-y-12">
      <motion.div variants={fadeIn("up", 0.1)}>
        <h1 className={`${anton.className} text-5xl font-bold mb-6 text-[#86AB5D]`}>FILE MANAGEMENT</h1>
        <p className="text-lg text-gray-700 mb-6" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          Learn how to upload, organize, and manage your documents in NoteUS.
        </p>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.2)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>UPLOADING DOCUMENTS</h2>

          {/* Decorative element */}
          <div className="absolute top-[-20px] right-[-30px] w-20 h-20 bg-[#86AB5D] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg relative">
            {/* Decorative top corner */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E48D44] opacity-5 rounded-bl-full"></div>

            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">
                NoteUS supports various file formats including PDFs, Word documents, text files, and images.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Method 1: Drag and Drop</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Simply drag files from your computer and drop them into the File Collection area.
                  </p>
                  <div className="bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=250"
                      alt="Drag and Drop Files"
                      className="rounded-lg w-full"
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#E48D44] rounded-full flex items-center justify-center mr-4">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Method 2: Upload Button</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Click the "+" button in the File Collection sidebar and select files from your computer.
                  </p>
                  <div className="bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=250"
                      alt="Upload Button"
                      className="rounded-lg w-full"
                    />
                  </div>
                </motion.div>
              </div>

              <div className="bg-[#E48D44]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#E48D44] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold flex items-center mb-4 text-[#E48D44] text-xl">
                    <FileText className="w-6 h-6 mr-3" />
                    Supported File Types
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-[15px] text-center">
                      <span className="inline-block w-3 h-3 bg-[#86AB5D] rounded-full mr-2"></span>
                      PDF (.pdf)
                    </div>
                    <div className="bg-white p-3 rounded-[15px] text-center">
                      <span className="inline-block w-3 h-3 bg-[#86AB5D] rounded-full mr-2"></span>
                      Word (.docx, .doc)
                    </div>
                    <div className="bg-white p-3 rounded-[15px] text-center">
                      <span className="inline-block w-3 h-3 bg-[#86AB5D] rounded-full mr-2"></span>
                      Text (.txt)
                    </div>
                    <div className="bg-white p-3 rounded-[15px] text-center">
                      <span className="inline-block w-3 h-3 bg-[#E48D44] rounded-full mr-2"></span>
                      Images (.jpg, .png)
                    </div>
                    <div className="bg-white p-3 rounded-[15px] text-center">
                      <span className="inline-block w-3 h-3 bg-[#E48D44] rounded-full mr-2"></span>
                      Markdown (.md)
                    </div>
                    <div className="bg-white p-3 rounded-[15px] text-center">
                      <span className="inline-block w-3 h-3 bg-[#E48D44] rounded-full mr-2"></span>
                      CSV (.csv)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.3)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>
            ORGANIZING FILES WITH FOLDERS
          </h2>

          {/* Decorative element */}
          <div className="absolute top-[-30px] left-[-20px] w-16 h-16 bg-[#E48D44] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg">
            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">
                Keep your documents organized by creating folders and subfolders.
              </p>

              <div className="space-y-8">
                <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                        <FolderPlus className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold text-xl text-[#3A5A40]">Creating Folders</h4>
                    </div>
                    <p className="text-gray-600 mb-4 text-lg">
                      Click the "+" button in the File Collection sidebar and select "Add Folder".
                    </p>
                    <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                      <li>Click the "+" button in the sidebar</li>
                      <li>Select "Add Folder" from the dropdown menu</li>
                      <li>Enter a name for your folder</li>
                      <li>Click "Create" to add the folder to your collection</li>
                    </ol>
                    <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                      <img
                        src="/placeholder.svg?height=150&width=400"
                        alt="Creating Folders"
                        className="rounded-lg w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-[#E48D44] opacity-10 rounded-br-full"></div>

                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-[#E48D44] rounded-full flex items-center justify-center mr-4">
                        <FolderPlus className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold text-xl text-[#3A5A40]">Creating Subfolders</h4>
                    </div>
                    <p className="text-gray-600 mb-4 text-lg">
                      Right-click on an existing folder and select "Add Subfolder".
                    </p>
                    <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                      <li>Right-click on the parent folder</li>
                      <li>Select "Add Subfolder" from the context menu</li>
                      <li>Enter a name for your subfolder</li>
                      <li>Click "Create" to add the subfolder</li>
                    </ol>
                    <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                      <img
                        src="/placeholder.svg?height=150&width=400"
                        alt="Creating Subfolders"
                        className="rounded-lg w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.4)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>MANAGING FILES</h2>

          {/* Decorative element */}
          <div className="absolute top-[-20px] right-[-30px] w-20 h-20 bg-[#86AB5D] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg relative">
            {/* Decorative top corner */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E48D44] opacity-5 rounded-bl-full"></div>

            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Searching for Files</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Use the search bar at the top of the File Collection sidebar to quickly find documents.
                  </p>
                  <div className="bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=250"
                      alt="Searching for Files"
                      className="rounded-lg w-full"
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#E48D44] rounded-full flex items-center justify-center mr-4">
                      <Trash2 className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Deleting Files</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Click the trash icon next to a file or right-click and select "Delete".
                  </p>
                  <div className="bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=250"
                      alt="Deleting Files"
                      className="rounded-lg w-full"
                    />
                  </div>
                </motion.div>
              </div>

              <div className="bg-[#E48D44]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#E48D44] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold mb-4 text-[#E48D44] text-xl">Important Notes</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">!</span>
                      </div>
                      <span>Deleted files cannot be recovered, so be careful when deleting documents.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">!</span>
                      </div>
                      <span>You can select multiple files by holding Ctrl (or Cmd on Mac) while clicking.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">!</span>
                      </div>
                      <span>Drag and drop files between folders to move them.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">!</span>
                      </div>
                      <span>
                        The maximum file size for uploads is 10MB for free accounts and 50MB for premium accounts.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.5)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>FILE PROCESSING</h2>

          {/* Decorative element */}
          <div className="absolute top-[-30px] left-[-20px] w-16 h-16 bg-[#E48D44] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg">
            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">
                When you upload a file, NoteUS processes it to extract text and prepare it for AI analysis.
              </p>

              <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-[#E48D44] opacity-10 rounded-br-full"></div>

                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Processing Status</h4>
                  </div>
                  <p className="text-gray-600 mb-4 text-lg">
                    You'll see a processing indicator when a file is being analyzed. This may take a few moments
                    depending on the file size and complexity.
                  </p>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=100&width=400"
                      alt="File Processing Status"
                      className="rounded-lg w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-[#86AB5D]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold mb-4 text-[#86AB5D] text-xl">Tips for Faster Processing</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>Use clear, well-formatted documents for best results.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>For PDFs, ensure they contain selectable text rather than scanned images.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>Break large documents into smaller, more focused files for faster processing.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>Premium accounts have priority processing for faster results.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
