"use client"

import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"
import { BookOpen, Upload, MessageSquare, Network, FlipHorizontal, ClipboardCheck, ArrowRight } from "lucide-react"
import { Anton } from "next/font/google"
import { useState } from "react"
import AuthUI from "@/components/auth-ui"

// Initialize Anton font
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export function GettingStartedSection() {
  const [showAuth, setShowAuth] = useState(false)

  const handleExploreMore = () => {
    setShowAuth(true)
  }

  return (
    <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" animate="show" className="space-y-12">
      <motion.div variants={fadeIn("up", 0.1)}>
        <h1 className={`${anton.className} text-5xl font-bold mb-6 text-[#86AB5D]`}>GETTING STARTED</h1>
        <p className="text-lg text-gray-700 mb-6" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          Welcome to NoteUS! This guide will help you get started with our platform and make the most of its features.
        </p>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.2)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>WHAT IS NOTEUS?</h2>

          {/* Decorative element */}
          <div className="absolute top-[-20px] right-[-30px] w-20 h-20 bg-[#86AB5D] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg relative">
            {/* Decorative top corner */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E48D44] opacity-5 rounded-bl-full"></div>

            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">
                NoteUS is an AI-powered note-taking assistant that helps you transform your notes into knowledge. Our
                platform offers a comprehensive set of tools to enhance your learning experience:
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
                    <h4 className="font-bold text-xl text-[#3A5A40]">Document Management</h4>
                  </div>
                  <p className="text-gray-600">
                    Upload and organize your documents, including PDFs, Word files, and text documents.
                  </p>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#E48D44] rounded-full flex items-center justify-center mr-4">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">AI Chat</h4>
                  </div>
                  <p className="text-gray-600">Ask questions about your documents and get instant, accurate answers.</p>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                      <Network className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Mind Maps</h4>
                  </div>
                  <p className="text-gray-600">
                    Visualize concepts and their relationships with automatically generated mind maps.
                  </p>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#E48D44] rounded-full flex items-center justify-center mr-4">
                      <FlipHorizontal className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Flashcards</h4>
                  </div>
                  <p className="text-gray-600">Create and study flashcards generated from your documents.</p>
                </motion.div>
              </div>

              <div className="bg-[#E48D44]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#E48D44] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold flex items-center mb-4 text-[#E48D44] text-xl">
                    <BookOpen className="w-6 h-6 mr-3" />
                    Why NoteUS?
                  </h4>
                  <p className="text-gray-700 text-lg">
                    NoteUS combines the power of artificial intelligence with proven learning techniques to help you
                    study more effectively. Whether you're a student, researcher, or professional, our tools can help
                    you better understand, remember, and apply the information in your documents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.3)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>CREATING YOUR ACCOUNT</h2>

          {/* Decorative element */}
          <div className="absolute top-[-30px] left-[-20px] w-16 h-16 bg-[#E48D44] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg">
            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">
                To get started with NoteUS, you'll need to create an account. Follow these simple steps:
              </p>

              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-[#86AB5D] text-white font-bold mr-6 text-2xl shadow-lg">
                    1
                  </div>
                  <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 flex-grow shadow-md">
                    <h4 className="font-bold mb-3 text-xl text-[#3A5A40]">Sign Up</h4>
                    <p className="text-gray-600">
                      Click the "Sign Up" button in the top-right corner of the page and fill out the registration form.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-[#86AB5D] text-white font-bold mr-6 text-2xl shadow-lg">
                    2
                  </div>
                  <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 flex-grow shadow-md">
                    <h4 className="font-bold mb-3 text-xl text-[#3A5A40]">Verify Your Email</h4>
                    <p className="text-gray-600">
                      Check your inbox for a verification email from NoteUS and click the verification link.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-[#86AB5D] text-white font-bold mr-6 text-2xl shadow-lg">
                    3
                  </div>
                  <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 flex-grow shadow-md">
                    <h4 className="font-bold mb-3 text-xl text-[#3A5A40]">Complete Your Profile</h4>
                    <p className="text-gray-600">
                      Add your profile information and preferences to personalize your experience.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-[#86AB5D] text-white font-bold mr-6 text-2xl shadow-lg">
                    4
                  </div>
                  <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 flex-grow shadow-md">
                    <h4 className="font-bold mb-3 text-xl text-[#3A5A40]">Explore the Dashboard</h4>
                    <p className="text-gray-600">
                      Once logged in, you'll be taken to your dashboard where you can start uploading documents and
                      using the features.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-[#E48D44]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-[#E48D44] opacity-10 rounded-br-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold mb-4 text-[#E48D44] text-xl">Account Types</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-[20px] shadow-md">
                      <h5 className="font-bold text-lg mb-3 text-[#86AB5D]">Free Account</h5>
                      <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        <li>Up to 10 documents</li>
                        <li>Basic AI chat functionality</li>
                        <li>3 mind maps per month</li>
                        <li>50 flashcards</li>
                        <li>5 quizzes per month</li>
                      </ul>
                    </div>
                    <div className="bg-white p-6 rounded-[20px] shadow-md">
                      <h5 className="font-bold text-lg mb-3 text-[#E48D44]">Premium Account</h5>
                      <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        <li>Unlimited documents</li>
                        <li>Advanced AI chat features</li>
                        <li>Unlimited mind maps</li>
                        <li>Unlimited flashcards</li>
                        <li>Unlimited quizzes</li>
                        <li>Priority processing</li>
                        <li>Collaboration features</li>
                      </ul>
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
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>YOUR FIRST STEPS</h2>

          {/* Decorative element */}
          <div className="absolute top-[-20px] right-[-30px] w-24 h-24 bg-[#86AB5D] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg">
            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">
                Now that you have an account, here's how to get started with NoteUS:
              </p>

              <div className="space-y-8">
                <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                  <div className="relative z-10">
                    <h4 className="font-bold mb-4 flex items-center text-xl text-[#3A5A40]">
                      <div className="w-10 h-10 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 text-white">
                        <Upload className="w-5 h-5" />
                      </div>
                      Step 1: Upload Your First Document
                    </h4>
                    <p className="text-gray-600 mb-4 text-lg">
                      Start by uploading a document you want to study or analyze.
                    </p>
                    <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                      <li>Go to the "Files" tab in the main navigation</li>
                      <li>Click the "+" button or drag and drop your file</li>
                      <li>Wait for the document to be processed (this may take a few moments)</li>
                      <li>Once processed, your document will appear in your file collection</li>
                    </ol>
                  </div>
                </div>

                <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-[#E48D44] opacity-10 rounded-br-full"></div>

                  <div className="relative z-10">
                    <h4 className="font-bold mb-4 flex items-center text-xl text-[#3A5A40]">
                      <div className="w-10 h-10 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 text-white">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      Step 2: Ask Questions About Your Document
                    </h4>
                    <p className="text-gray-600 mb-4 text-lg">
                      Use the AI chat to interact with your document and get answers to your questions.
                    </p>
                    <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                      <li>Select your document from the file collection</li>
                      <li>Click on the "Chat" tab</li>
                      <li>Type your question in the chat input</li>
                      <li>Receive an AI-generated answer based on your document's content</li>
                    </ol>
                  </div>
                </div>

                <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                  <div className="relative z-10">
                    <h4 className="font-bold mb-4 flex items-center text-xl text-[#3A5A40]">
                      <div className="w-10 h-10 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 text-white">
                        <Network className="w-5 h-5" />
                      </div>
                      Step 3: Generate a Mind Map
                    </h4>
                    <p className="text-gray-600 mb-4 text-lg">
                      Visualize the key concepts in your document with a mind map.
                    </p>
                    <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                      <li>With your document selected, click on the "Mind Map" tab</li>
                      <li>Click "Generate Mind Map"</li>
                      <li>Explore the generated mind map to understand the relationships between concepts</li>
                      <li>Click on nodes to see more details or to focus your AI chat on specific topics</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <motion.button
                  className="bg-[#E48D44] text-white px-8 py-4 rounded-full flex items-center gap-3 hover:bg-[#E48D44]/90 transition-colors text-lg font-bold shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExploreMore}
                >
                  <span>Explore More Features</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.5)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>NEXT STEPS</h2>

          {/* Decorative element */}
          <div className="absolute top-[-30px] left-[-20px] w-16 h-16 bg-[#E48D44] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg">
            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">
                Once you're familiar with the basics, here are some next steps to make the most of NoteUS:
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#E48D44] rounded-full flex items-center justify-center mr-4">
                      <FlipHorizontal className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Create Flashcards</h4>
                  </div>
                  <p className="text-gray-600">
                    Generate flashcards from your documents to help memorize key concepts and facts. You can create them
                    automatically or manually customize each card.
                  </p>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                      <ClipboardCheck className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Take Quizzes</h4>
                  </div>
                  <p className="text-gray-600">
                    Test your knowledge with AI-generated quizzes based on your documents. Track your progress and focus
                    on areas that need improvement.
                  </p>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#E48D44] rounded-full flex items-center justify-center mr-4">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Organize with Folders</h4>
                  </div>
                  <p className="text-gray-600">
                    Create folders to organize your documents by subject, course, or project. This helps you keep your
                    workspace tidy and efficient.
                  </p>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Try Advanced Queries</h4>
                  </div>
                  <p className="text-gray-600">
                    Experiment with more complex questions in the AI chat. You can ask for summaries, explanations,
                    comparisons, and more.
                  </p>
                </motion.div>
              </div>

              <div className="bg-[#E48D44]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E48D44] opacity-10 rounded-bl-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold mb-4 text-[#E48D44] text-xl">Pro Tips</h4>
                  <ul className="grid md:grid-cols-2 gap-x-6 gap-y-3 text-gray-700">
                    <li className="flex items-center">
                      <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      Use the search function to quickly find specific documents
                    </li>
                    <li className="flex items-center">
                      <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      Combine multiple documents for comprehensive AI chat responses
                    </li>
                    <li className="flex items-center">
                      <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      Export your mind maps and flashcards for offline study
                    </li>
                    <li className="flex items-center">
                      <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      Set up regular study sessions using the spaced repetition feature
                    </li>
                    <li className="flex items-center">
                      <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      Check out our video tutorials for detailed feature walkthroughs
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Auth Modal Overlay */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuth(false)} />
          <div className="z-10 w-full max-w-md">
            <AuthUI
              onAuthSuccess={() => {
                setShowAuth(false)
                window.location.href = "/defaultPage"
              }}
            />
            <button
              onClick={() => setShowAuth(false)}
              className="mt-4 text-white hover:underline text-sm mx-auto block"
            >
              Return to documentation
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
