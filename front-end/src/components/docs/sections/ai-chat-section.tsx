"use client"

import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"
import { MessageSquare, Lightbulb, AlertCircle, Sparkles, Zap } from "lucide-react"
import { Anton } from "next/font/google"

// Initialize Anton font
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export function AIChatSection() {
  return (
    <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" animate="show" className="space-y-12">
      <motion.div variants={fadeIn("up", 0.1)}>
        <h1 className={`${anton.className} text-5xl font-bold mb-6 text-[#86AB5D]`}>AI CHAT</h1>
        <p className="text-lg text-gray-700 mb-6" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          Learn how to use the AI chat feature to interact with your documents and get instant answers.
        </p>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.2)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>
            GETTING STARTED WITH AI CHAT
          </h2>

          {/* Decorative element */}
          <div className="absolute top-[-20px] right-[-30px] w-20 h-20 bg-[#86AB5D] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg relative">
            {/* Decorative top corner */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E48D44] opacity-5 rounded-bl-full"></div>

            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">
                The AI chat feature allows you to ask questions about your documents and get instant, accurate answers
                powered by advanced language models.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Starting a Chat</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Select a document from your file collection, then type your question in the chat input at the bottom
                    of the screen.
                  </p>
                  <div className="bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=250"
                      alt="Starting a Chat"
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
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Asking Effective Questions</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Be specific with your questions to get the most accurate answers. You can ask about facts, concepts,
                    or request summaries.
                  </p>
                  <div className="bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=250"
                      alt="Asking Questions"
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
                    <AlertCircle className="w-6 h-6 mr-3" />
                    Important Note
                  </h4>
                  <p className="text-gray-700 text-lg">
                    For the AI to answer questions about your documents, you must first select one or more files from
                    your collection. The AI will only have access to the content of the selected documents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.3)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>
            TYPES OF QUESTIONS YOU CAN ASK
          </h2>

          {/* Decorative element */}
          <div className="absolute top-[-30px] left-[-20px] w-16 h-16 bg-[#E48D44] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg">
            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">
                The AI can answer a wide variety of questions about your documents. Here are some examples:
              </p>

              <div className="space-y-6">
                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="font-bold mb-4 text-xl text-[#3A5A40] flex items-center">
                    <div className="w-8 h-8 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 text-white text-sm">
                      1
                    </div>
                    Factual Questions
                  </h4>
                  <div className="border-l-4 border-[#86AB5D] pl-4 py-3 mb-3 bg-white rounded-r-lg">
                    <p className="text-gray-700 italic">"What is the capital of France mentioned in the document?"</p>
                  </div>
                  <div className="border-l-4 border-[#86AB5D] pl-4 py-3 bg-white rounded-r-lg">
                    <p className="text-gray-700 italic">
                      "When was the Treaty of Versailles signed according to the text?"
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="font-bold mb-4 text-xl text-[#3A5A40] flex items-center">
                    <div className="w-8 h-8 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 text-white text-sm">
                      2
                    </div>
                    Conceptual Questions
                  </h4>
                  <div className="border-l-4 border-[#E48D44] pl-4 py-3 mb-3 bg-white rounded-r-lg">
                    <p className="text-gray-700 italic">
                      "Can you explain the concept of photosynthesis as described in the document?"
                    </p>
                  </div>
                  <div className="border-l-4 border-[#E48D44] pl-4 py-3 bg-white rounded-r-lg">
                    <p className="text-gray-700 italic">"How does the author define machine learning in this paper?"</p>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="font-bold mb-4 text-xl text-[#3A5A40] flex items-center">
                    <div className="w-8 h-8 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 text-white text-sm">
                      3
                    </div>
                    Summary Requests
                  </h4>
                  <div className="border-l-4 border-[#86AB5D] pl-4 py-3 mb-3 bg-white rounded-r-lg">
                    <p className="text-gray-700 italic">"Summarize the main points of this document."</p>
                  </div>
                  <div className="border-l-4 border-[#86AB5D] pl-4 py-3 bg-white rounded-r-lg">
                    <p className="text-gray-700 italic">"What are the key arguments presented in chapter 3?"</p>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="font-bold mb-4 text-xl text-[#3A5A40] flex items-center">
                    <div className="w-8 h-8 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 text-white text-sm">
                      4
                    </div>
                    Comparative Questions
                  </h4>
                  <div className="border-l-4 border-[#E48D44] pl-4 py-3 mb-3 bg-white rounded-r-lg">
                    <p className="text-gray-700 italic">
                      "What are the similarities between the two theories discussed in these papers?"
                    </p>
                  </div>
                  <div className="border-l-4 border-[#E48D44] pl-4 py-3 bg-white rounded-r-lg">
                    <p className="text-gray-700 italic">
                      "How do the authors' views on climate change differ in these documents?"
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.4)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>ADVANCED CHAT FEATURES</h2>

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
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Multi-Document Queries</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Select multiple documents to ask questions that span across different sources. The AI will
                    synthesize information from all selected documents.
                  </p>
                  <div className="bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=250"
                      alt="Multi-Document Queries"
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
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Using Mind Map Context</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    When viewing a mind map, you can select specific nodes and use them as context for your questions,
                    focusing the AI on particular concepts.
                  </p>
                  <div className="bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=250"
                      alt="Mind Map Context"
                      className="rounded-lg w-full"
                    />
                  </div>
                </motion.div>
              </div>

              <div className="bg-[#E48D44]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#E48D44] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold mb-4 text-[#E48D44] text-xl">Pro Tips</h4>
                  <ul className="grid md:grid-cols-2 gap-x-6 gap-y-3 text-gray-700">
                    <li className="flex items-center">
                      <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <strong>Conversation History:</strong> The AI remembers your conversation, so you can ask
                      follow-up questions
                    </li>
                    <li className="flex items-center">
                      <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <strong>Regenerate Responses:</strong> Click the refresh icon to get a different response
                    </li>
                    <li className="flex items-center">
                      <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <strong>Save Important Answers:</strong> Bookmark responses for future reference
                    </li>
                    <li className="flex items-center">
                      <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <strong>Export Conversations:</strong> Save chat history as PDF or text
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
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>
            LIMITATIONS AND BEST PRACTICES
          </h2>

          {/* Decorative element */}
          <div className="absolute top-[-30px] left-[-20px] w-16 h-16 bg-[#E48D44] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg">
            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">
                While our AI is powerful, it's important to understand its limitations and how to get the best results.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-[#E48D44] opacity-10 rounded-br-full"></div>

                  <div className="relative z-10">
                    <h4 className="font-bold mb-4 text-xl text-[#E48D44]">Limitations</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">!</span>
                        </div>
                        <span>The AI can only answer based on the content of your selected documents.</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">!</span>
                        </div>
                        <span>It may not understand complex diagrams or equations in your documents.</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">!</span>
                        </div>
                        <span>Very long documents may be truncated, so the AI might miss information at the end.</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">!</span>
                        </div>
                        <span>The AI doesn't have real-time internet access to verify information.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                  <div className="relative z-10">
                    <h4 className="font-bold mb-4 text-xl text-[#86AB5D]">Best Practices</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>Break down complex questions into simpler, more specific queries.</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>Select only the relevant documents for your questions to improve accuracy.</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>Use the mind map feature to understand document structure before asking questions.</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>For technical content, ask the AI to explain concepts step by step.</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>Verify important information by asking the AI to cite specific sections.</span>
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
