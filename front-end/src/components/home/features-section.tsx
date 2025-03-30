"use client"

import { MessageSquare, Upload, Network, FlipHorizontal, ClipboardCheck, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"

export function FeaturesSection() {
  return (
    <motion.div
      className="py-20 bg-white"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      variants={staggerContainer(0.1, 0.1)}
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div className="text-center mb-16" variants={fadeIn("up", 0.1)}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform offers a comprehensive set of tools to help you learn more effectively and efficiently.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <motion.div
            className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            variants={fadeIn("up", 0.2)}
          >
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Upload className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Upload Any Document</h3>
            <p className="text-gray-600">
              Upload PDFs, Word documents, or even YouTube videos to extract and analyze content.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            variants={fadeIn("up", 0.3)}
          >
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Ask Questions</h3>
            <p className="text-gray-600">
              Ask questions about your documents and get instant, accurate answers powered by AI.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            variants={fadeIn("up", 0.4)}
          >
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <Network className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Create Mind Maps</h3>
            <p className="text-gray-600">
              Visualize concepts and their relationships with automatically generated mind maps.
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div
            className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            variants={fadeIn("up", 0.5)}
          >
            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <FlipHorizontal className="w-7 h-7 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Flashcards</h3>
            <p className="text-gray-600">
              Generate flashcards from your notes to help you memorize key concepts and facts.
            </p>
          </motion.div>

          {/* Feature 5 */}
          <motion.div
            className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            variants={fadeIn("up", 0.6)}
          >
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <ClipboardCheck className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Quizzes</h3>
            <p className="text-gray-600">
              Test your knowledge with automatically generated quizzes based on your content.
            </p>
          </motion.div>

          {/* Feature 6 */}
          <motion.div
            className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            variants={fadeIn("up", 0.7)}
          >
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI-Powered Insights</h3>
            <p className="text-gray-600">
              Get intelligent summaries, key points, and connections between different documents.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

