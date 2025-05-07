"use client"

import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"
import { Network, ZoomIn, ZoomOut, RefreshCw, Download, Palette, Lightbulb } from "lucide-react"
import { Anton } from "next/font/google"

// Initialize Anton font
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export function MindMapsSection() {
  return (
    <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" animate="show" className="space-y-12">
      <motion.div variants={fadeIn("up", 0.1)}>
        <h1 className={`${anton.className} text-5xl font-bold mb-6 text-[#86AB5D]`}>MIND MAPS</h1>
        <p className="text-lg text-gray-700 mb-6" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          Learn how to use the mind mapping feature to visualize connections between concepts in your documents.
        </p>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.2)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>UNDERSTANDING MIND MAPS</h2>

          {/* Decorative element */}
          <div className="absolute top-[-20px] right-[-30px] w-20 h-20 bg-[#86AB5D] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg relative">
            {/* Decorative top corner */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E48D44] opacity-5 rounded-bl-full"></div>

            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">
                Mind maps are visual representations of information that show relationships between different concepts.
                In NoteUS, mind maps are automatically generated from your documents to help you understand and remember
                key information.
              </p>

              <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md mb-8 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                      <Network className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">How Mind Maps Work</h4>
                  </div>
                  <p className="text-gray-600 mb-4 text-lg">
                    Our AI analyzes your document and identifies key concepts, their relationships, and hierarchies. It
                    then organizes this information into a visual mind map with the main topic at the center and related
                    subtopics branching outward.
                  </p>
                  <div className="bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=200&width=500"
                      alt="Mind Map Example"
                      className="rounded-lg w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#E48D44]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-[#E48D44] opacity-10 rounded-br-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold flex items-center mb-4 text-[#E48D44] text-xl">
                    <Lightbulb className="w-6 h-6 mr-3" />
                    Benefits of Mind Maps
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Visual Learning:</strong> See connections between ideas at a glance
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Better Retention:</strong> Visual organization helps with memory and recall
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Concept Relationships:</strong> Understand how different ideas relate to each other
                        </span>
                      </li>
                    </ul>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Big Picture View:</strong> Get an overview of the entire document's structure
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Focus on Key Points:</strong> Identify the most important concepts quickly
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Creative Thinking:</strong> Stimulate new ideas and connections
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.3)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>GENERATING MIND MAPS</h2>

          {/* Decorative element */}
          <div className="absolute top-[-30px] left-[-20px] w-16 h-16 bg-[#E48D44] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg">
            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">Creating mind maps in NoteUS is simple and automated.</p>

              <div className="space-y-8">
                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="font-bold mb-4 text-xl text-[#3A5A40] flex items-center">
                    <div className="w-10 h-10 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 text-white">
                      <span className="text-lg">1</span>
                    </div>
                    Step 1: Select Your Document
                  </h4>
                  <p className="text-gray-600 mb-4 text-lg">
                    Choose one or more documents from your file collection that you want to visualize.
                  </p>
                  <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                    <li>Go to your file collection</li>
                    <li>Select the document(s) you want to create a mind map from</li>
                    <li>You can select multiple documents to create a combined mind map</li>
                  </ol>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=400"
                      alt="Select Document"
                      className="rounded-lg w-full"
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="font-bold mb-4 text-xl text-[#3A5A40] flex items-center">
                    <div className="w-10 h-10 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 text-white">
                      <span className="text-lg">2</span>
                    </div>
                    Step 2: Click the Mind Map Button
                  </h4>
                  <p className="text-gray-600 mb-4 text-lg">
                    Click the mind map icon in the right panel to generate a mind map from your selected document(s).
                  </p>
                  <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                    <li>Look for the mind map icon in the right panel</li>
                    <li>Click the icon to start the mind map generation process</li>
                    <li>You can also access mind maps from the top navigation menu</li>
                  </ol>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=400"
                      alt="Mind Map Button"
                      className="rounded-lg w-full"
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="font-bold mb-4 text-xl text-[#3A5A40] flex items-center">
                    <div className="w-10 h-10 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 text-white">
                      <span className="text-lg">3</span>
                    </div>
                    Step 3: Wait for Processing
                  </h4>
                  <p className="text-gray-600 mb-4 text-lg">
                    The AI will analyze your document and generate a mind map. This may take a few moments depending on
                    the document size.
                  </p>
                  <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                    <li>A progress indicator will show the processing status</li>
                    <li>The AI is analyzing the content and identifying key concepts</li>
                    <li>Once complete, your mind map will be displayed automatically</li>
                  </ol>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=400"
                      alt="Processing Mind Map"
                      className="rounded-lg w-full"
                    />
                  </div>
                </motion.div>
              </div>

              <div className="mt-8 bg-[#E48D44]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#E48D44] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold mb-4 text-[#E48D44] text-xl">Processing Time</h4>
                  <p className="text-gray-700 text-lg">
                    Mind map generation typically takes 10-30 seconds for standard documents. Larger or more complex
                    documents may take longer. Premium accounts have priority processing for faster results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.4)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>
            NAVIGATING AND CUSTOMIZING MIND MAPS
          </h2>

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
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Zooming and Panning</h4>
                  </div>
                  <p className="text-gray-600 mb-4">Navigate your mind map easily with intuitive controls:</p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      <strong>Zoom In:</strong> Click the + button or use mouse wheel
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      <strong>Zoom Out:</strong> Click the - button or use mouse wheel
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      <strong>Pan:</strong> Click and drag on empty space
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      <strong>Reset View:</strong> Click the reset button to center the map
                    </li>
                  </ul>
                  <div className="mt-4 flex items-center justify-center gap-4">
                    <div className="bg-white p-3 rounded-full shadow-md">
                      <ZoomIn className="w-5 h-5 text-[#86AB5D]" />
                    </div>
                    <div className="bg-white p-3 rounded-full shadow-md">
                      <ZoomOut className="w-5 h-5 text-[#86AB5D]" />
                    </div>
                    <div className="bg-white p-3 rounded-full shadow-md">
                      <RefreshCw className="w-5 h-5 text-[#86AB5D]" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#E48D44] rounded-full flex items-center justify-center mr-4">
                      <Palette className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Changing Themes</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    You can change the visual style of your mind map by selecting different themes from the dropdown
                    menu.
                  </p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                      <strong>Color Schemes:</strong> Choose from various color palettes
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                      <strong>Layout Styles:</strong> Radial, tree, or hierarchical layouts
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                      <strong>Node Shapes:</strong> Customize the appearance of nodes
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                      <strong>Connection Styles:</strong> Different line styles for connections
                    </li>
                  </ul>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="h-10 rounded-[10px] bg-blue-100 border border-blue-200 shadow-sm"></div>
                    <div className="h-10 rounded-[10px] bg-green-100 border border-green-200 shadow-sm"></div>
                    <div className="h-10 rounded-[10px] bg-purple-100 border border-purple-200 shadow-sm"></div>
                  </div>
                </motion.div>
              </div>

              <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                      <Network className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Interacting with Nodes</h4>
                  </div>
                  <p className="text-gray-600 mb-4 text-lg">
                    Mind map nodes are interactive and provide additional functionality:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ul className="space-y-2 pl-4">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                        <strong>Click a Node:</strong> View detailed content related to that concept
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                        <strong>Double-click a Node:</strong> Expand or collapse its children
                      </li>
                    </ul>
                    <ul className="space-y-2 pl-4">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                        <strong>Right-click a Node:</strong> Open a context menu with additional options
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                        <strong>Drag a Node:</strong> Rearrange the mind map layout
                      </li>
                    </ul>
                  </div>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=400"
                      alt="Node Interaction"
                      className="rounded-lg w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.5)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>
            USING MIND MAPS WITH AI CHAT
          </h2>

          {/* Decorative element */}
          <div className="absolute top-[-30px] left-[-20px] w-16 h-16 bg-[#E48D44] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg">
            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">
                One of the most powerful features of NoteUS is the integration between mind maps and the AI chat.
              </p>

              <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden mb-8">
                {/* Decorative element */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-[#E48D44] opacity-10 rounded-br-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold mb-4 text-xl text-[#3A5A40]">Node Selection for Context</h4>
                  <p className="text-gray-600 mb-4 text-lg">
                    You can select specific nodes in your mind map to use as context for your AI chat questions. This
                    helps focus the AI on particular concepts or sections of your document.
                  </p>
                  <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                    <li>Select one or more nodes in your mind map</li>
                    <li>Click the "Use as Context" button</li>
                    <li>The AI chat will now focus on the content related to those nodes</li>
                    <li>Ask questions specifically about the selected concepts</li>
                  </ol>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=400"
                      alt="Node Selection"
                      className="rounded-lg w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#86AB5D]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold mb-4 text-[#86AB5D] text-xl">Pro Tips for Mind Map + AI Integration</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>Select multiple related nodes to ask questions about how concepts connect</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>Use mind maps to identify knowledge gaps, then ask targeted questions</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>Create flashcards directly from mind map nodes for efficient studying</span>
                      </li>
                    </ul>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>Generate quizzes based on specific branches of your mind map</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>Export mind maps as images to include in your notes or presentations</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>Use the mind map to navigate through complex documents more easily</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.6)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>
            EXPORTING AND SHARING MIND MAPS
          </h2>

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
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Exporting as PDF</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Click the export button and select "PDF" to save your mind map as a PDF document.
                  </p>
                  <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                    <li>Click the export button in the mind map toolbar</li>
                    <li>Select "PDF" from the dropdown menu</li>
                    <li>Choose your preferred page size and orientation</li>
                    <li>Click "Export" to download your mind map as a PDF</li>
                  </ol>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=250"
                      alt="Export as PDF"
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
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Exporting as Image</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Click the export button and select "PNG" or "JPG" to save your mind map as an image file.
                  </p>
                  <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                    <li>Click the export button in the mind map toolbar</li>
                    <li>Select "PNG" or "JPG" from the dropdown menu</li>
                    <li>Choose your preferred resolution</li>
                    <li>Click "Export" to download your mind map as an image</li>
                  </ol>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=250"
                      alt="Export as Image"
                      className="rounded-lg w-full"
                    />
                  </div>
                </motion.div>
              </div>

              <div className="bg-[#E48D44]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#E48D44] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold mb-4 text-[#E48D44] text-xl">Sharing Options</h4>
                  <p className="text-gray-700 text-lg mb-4">Premium users can share mind maps directly with others:</p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Share Link:</strong> Generate a shareable link that others can view
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Collaborate:</strong> Invite others to view and edit your mind map
                        </span>
                      </li>
                    </ul>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Embed:</strong> Add your mind map to websites or learning management systems
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Present Mode:</strong> Use mind maps for interactive presentations
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
