"use client"

import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"
import { MessageSquare, Lightbulb, AlertCircle, Sparkles, Zap } from "lucide-react"

export function AIChatSection() {
  return (
    <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeIn("up", 0.1)}>
        <h1 className="text-3xl font-bold mb-4">AI Chat</h1>
        <p className="text-lg text-gray-700 mb-6">
          Learn how to use the AI chat feature to interact with your documents and get instant answers.
        </p>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.2)}>
        <h2 className="text-xl font-semibold mb-4">Getting Started with AI Chat</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              The AI chat feature allows you to ask questions about your documents and get instant, accurate answers
              powered by advanced language models.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <MessageSquare className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium">Starting a Chat</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Select a document from your file collection, then type your question in the chat input at the bottom
                  of the screen.
                </p>
                <img
                  src="/placeholder.svg?height=150&width=250"
                  alt="Starting a Chat"
                  className="rounded-lg border w-full"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Lightbulb className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium">Asking Effective Questions</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Be specific with your questions to get the most accurate answers. You can ask about facts, concepts,
                  or request summaries.
                </p>
                <img
                  src="/placeholder.svg?height=150&width=250"
                  alt="Asking Questions"
                  className="rounded-lg border w-full"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                Important Note
              </h4>
              <p className="text-sm text-gray-700">
                For the AI to answer questions about your documents, you must first select one or more files from your
                collection. The AI will only have access to the content of the selected documents.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.3)}>
        <h2 className="text-xl font-semibold mb-4">Types of Questions You Can Ask</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              The AI can answer a wide variety of questions about your documents. Here are some examples:
            </p>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Factual Questions</h4>
                <div className="border-l-4 border-green-500 pl-3 py-1 mb-2">
                  <p className="text-sm italic">"What is the capital of France mentioned in the document?"</p>
                </div>
                <div className="border-l-4 border-green-500 pl-3 py-1">
                  <p className="text-sm italic">"When was the Treaty of Versailles signed according to the text?"</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Conceptual Questions</h4>
                <div className="border-l-4 border-blue-500 pl-3 py-1 mb-2">
                  <p className="text-sm italic">
                    "Can you explain the concept of photosynthesis as described in the document?"
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-3 py-1">
                  <p className="text-sm italic">"How does the author define machine learning in this paper?"</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Summary Requests</h4>
                <div className="border-l-4 border-purple-500 pl-3 py-1 mb-2">
                  <p className="text-sm italic">"Summarize the main points of this document."</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-3 py-1">
                  <p className="text-sm italic">"What are the key arguments presented in chapter 3?"</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Comparative Questions</h4>
                <div className="border-l-4 border-yellow-500 pl-3 py-1 mb-2">
                  <p className="text-sm italic">
                    "What are the similarities between the two theories discussed in these papers?"
                  </p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-3 py-1">
                  <p className="text-sm italic">
                    "How do the authors' views on climate change differ in these documents?"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.4)}>
        <h2 className="text-xl font-semibold mb-4">Advanced Chat Features</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
                  <h4 className="font-medium">Multi-Document Queries</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Select multiple documents to ask questions that span across different sources. The AI will synthesize
                  information from all selected documents.
                </p>
                <img
                  src="/placeholder.svg?height=150&width=250"
                  alt="Multi-Document Queries"
                  className="rounded-lg border w-full"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Zap className="w-5 h-5 text-yellow-600 mr-2" />
                  <h4 className="font-medium">Using Mind Map Context</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  When viewing a mind map, you can select specific nodes and use them as context for your questions,
                  focusing the AI on particular concepts.
                </p>
                <img
                  src="/placeholder.svg?height=150&width=250"
                  alt="Mind Map Context"
                  className="rounded-lg border w-full"
                />
              </div>
            </div>

            <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-100">
              <h4 className="font-medium mb-2 text-green-800">Pro Tips</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>
                  <strong>Conversation History:</strong> The AI remembers your conversation, so you can ask follow-up
                  questions without repeating context.
                </li>
                <li>
                  <strong>Regenerate Responses:</strong> If you're not satisfied with an answer, click the refresh icon
                  to get a different response.
                </li>
                <li>
                  <strong>Save Important Answers:</strong> Click the bookmark icon to save important responses for
                  future reference.
                </li>
                <li>
                  <strong>Export Conversations:</strong> You can export your chat history as a PDF or text file for your
                  records.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.5)}>
        <h2 className="text-xl font-semibold mb-4">Limitations and Best Practices</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              While our AI is powerful, it's important to understand its limitations and how to get the best results.
            </p>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-6">
              <h4 className="font-medium mb-2 text-yellow-800">Limitations</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>The AI can only answer based on the content of your selected documents.</li>
                <li>It may not understand complex diagrams or equations in your documents.</li>
                <li>Very long documents may be truncated, so the AI might miss information at the end.</li>
                <li>The AI doesn't have real-time internet access to verify information.</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h4 className="font-medium mb-2 text-green-800">Best Practices</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>Break down complex questions into simpler, more specific queries.</li>
                <li>Select only the relevant documents for your questions to improve accuracy.</li>
                <li>Use the mind map feature to understand document structure before asking questions.</li>
                <li>For technical content, ask the AI to explain concepts step by step.</li>
                <li>Verify important information by asking the AI to cite specific sections from your documents.</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
