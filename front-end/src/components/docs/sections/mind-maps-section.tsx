"use client"

import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"
import { Network, ZoomIn, ZoomOut, RefreshCw, Download, Palette, Lightbulb } from "lucide-react"

export function MindMapsSection() {
  return (
    <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeIn("up", 0.1)}>
        <h1 className="text-3xl font-bold mb-4">Mind Maps</h1>
        <p className="text-lg text-gray-700 mb-6">
          Learn how to use the mind mapping feature to visualize connections between concepts in your documents.
        </p>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.2)}>
        <h2 className="text-xl font-semibold mb-4">Understanding Mind Maps</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Mind maps are visual representations of information that show relationships between different concepts. In
              NoteUS, mind maps are automatically generated from your documents to help you understand and remember key
              information.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center mb-3">
                <Network className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium">How Mind Maps Work</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Our AI analyzes your document and identifies key concepts, their relationships, and hierarchies. It then
                organizes this information into a visual mind map with the main topic at the center and related
                subtopics branching outward.
              </p>
              <img
                src="/placeholder.svg?height=200&width=500"
                alt="Mind Map Example"
                className="rounded-lg border w-full"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium flex items-center mb-2">
                <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
                Benefits of Mind Maps
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>
                  <strong>Visual Learning:</strong> See connections between ideas at a glance
                </li>
                <li>
                  <strong>Better Retention:</strong> Visual organization helps with memory and recall
                </li>
                <li>
                  <strong>Concept Relationships:</strong> Understand how different ideas relate to each other
                </li>
                <li>
                  <strong>Big Picture View:</strong> Get an overview of the entire document's structure
                </li>
                <li>
                  <strong>Focus on Key Points:</strong> Identify the most important concepts quickly
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.3)}>
        <h2 className="text-xl font-semibold mb-4">Generating Mind Maps</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 mb-4">Creating mind maps in NoteUS is simple and automated.</p>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Step 1: Select Your Document</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Choose one or more documents from your file collection that you want to visualize.
                </p>
                <img
                  src="/placeholder.svg?height=150&width=400"
                  alt="Select Document"
                  className="rounded-lg border w-full"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Step 2: Click the Mind Map Button</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Click the mind map icon in the right panel to generate a mind map from your selected document(s).
                </p>
                <img
                  src="/placeholder.svg?height=150&width=400"
                  alt="Mind Map Button"
                  className="rounded-lg border w-full"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Step 3: Wait for Processing</h4>
                <p className="text-sm text-gray-600 mb-3">
                  The AI will analyze your document and generate a mind map. This may take a few moments depending on
                  the document size.
                </p>
                <img
                  src="/placeholder.svg?height=150&width=400"
                  alt="Processing Mind Map"
                  className="rounded-lg border w-full"
                />
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h4 className="font-medium mb-2 text-yellow-800">Processing Time</h4>
              <p className="text-sm text-gray-700">
                Mind map generation typically takes 10-30 seconds for standard documents. Larger or more complex
                documents may take longer. Premium accounts have priority processing for faster results.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.4)}>
        <h2 className="text-xl font-semibold mb-4">Navigating and Customizing Mind Maps</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <ZoomIn className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium">Zooming and Panning</h4>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>
                    <strong>Zoom In:</strong> Click the + button or use mouse wheel
                  </li>
                  <li>
                    <strong>Zoom Out:</strong> Click the - button or use mouse wheel
                  </li>
                  <li>
                    <strong>Pan:</strong> Click and drag on empty space
                  </li>
                  <li>
                    <strong>Reset View:</strong> Click the reset button to center the map
                  </li>
                </ul>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <ZoomIn className="w-4 h-4 text-gray-600" />
                  <ZoomOut className="w-4 h-4 text-gray-600" />
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Palette className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium">Changing Themes</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  You can change the visual style of your mind map by selecting different themes from the dropdown menu.
                </p>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="h-8 rounded bg-blue-100 border border-blue-200"></div>
                  <div className="h-8 rounded bg-green-100 border border-green-200"></div>
                  <div className="h-8 rounded bg-purple-100 border border-purple-200"></div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Network className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium">Interacting with Nodes</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Mind map nodes are interactive and provide additional functionality:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>
                  <strong>Click a Node:</strong> View detailed content related to that concept
                </li>
                <li>
                  <strong>Double-click a Node:</strong> Expand or collapse its children
                </li>
                <li>
                  <strong>Right-click a Node:</strong> Open a context menu with additional options
                </li>
                <li>
                  <strong>Drag a Node:</strong> Rearrange the mind map layout
                </li>
              </ul>
              <img
                src="/placeholder.svg?height=150&width=400"
                alt="Node Interaction"
                className="rounded-lg border w-full mt-3"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.5)}>
        <h2 className="text-xl font-semibold mb-4">Using Mind Maps with AI Chat</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              One of the most powerful features of NoteUS is the integration between mind maps and the AI chat.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium mb-3">Node Selection for Context</h4>
              <p className="text-sm text-gray-600 mb-3">
                You can select specific nodes in your mind map to use as context for your AI chat questions. This helps
                focus the AI on particular concepts or sections of your document.
              </p>
              <img
                src="/placeholder.svg?height=150&width=400"
                alt="Node Selection"
                className="rounded-lg border w-full"
              />
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h4 className="font-medium mb-2 text-green-800">Pro Tips for Mind Map + AI Integration</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>Select multiple related nodes to ask questions about how concepts connect</li>
                <li>Use mind maps to identify knowledge gaps, then ask targeted questions</li>
                <li>Create flashcards directly from mind map nodes for efficient studying</li>
                <li>Generate quizzes based on specific branches of your mind map</li>
                <li>Export mind maps as images to include in your notes or presentations</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.6)}>
        <h2 className="text-xl font-semibold mb-4">Exporting and Sharing Mind Maps</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Download className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium">Exporting as PDF</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Click the export button and select "PDF" to save your mind map as a PDF document.
                </p>
                <img
                  src="/placeholder.svg?height=150&width=250"
                  alt="Export as PDF"
                  className="rounded-lg border w-full"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Download className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium">Exporting as Image</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Click the export button and select "PNG" or "JPG" to save your mind map as an image file.
                </p>
                <img
                  src="/placeholder.svg?height=150&width=250"
                  alt="Export as Image"
                  className="rounded-lg border w-full"
                />
              </div>
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium mb-2 text-blue-800">Sharing Options</h4>
              <p className="text-sm text-gray-700 mb-3">Premium users can share mind maps directly with others:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>
                  <strong>Share Link:</strong> Generate a shareable link that others can view
                </li>
                <li>
                  <strong>Collaborate:</strong> Invite others to view and edit your mind map
                </li>
                <li>
                  <strong>Embed:</strong> Add your mind map to websites or learning management systems
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
