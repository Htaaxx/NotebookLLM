"use client"

import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"
import { ClipboardCheck, Settings, BarChart, Clock, Award } from "lucide-react"
import { Anton } from "next/font/google"

// Initialize Anton font
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export function QuizzesSection() {
  return (
    <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" animate="show" className="space-y-12">
      <motion.div variants={fadeIn("up", 0.1)}>
        <h1 className={`${anton.className} text-5xl font-bold mb-6 text-[#86AB5D]`}>QUIZZES</h1>
        <p className="text-lg text-gray-700 mb-6" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          Learn how to use the quiz feature to test your knowledge and reinforce your learning.
        </p>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.2)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>UNDERSTANDING QUIZZES</h2>

          {/* Decorative element */}
          <div className="absolute top-[-20px] right-[-30px] w-20 h-20 bg-[#86AB5D] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg relative">
            {/* Decorative top corner */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E48D44] opacity-5 rounded-bl-full"></div>

            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">
                Quizzes in NoteUS are automatically generated from your documents to help you test your understanding
                and identify knowledge gaps.
              </p>

              <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md mb-8 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                      <ClipboardCheck className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">How Quizzes Work</h4>
                  </div>
                  <p className="text-gray-600 mb-4 text-lg">
                    Our AI analyzes your documents and creates various types of questions to test your knowledge. You
                    can take quizzes, receive immediate feedback, and track your progress over time.
                  </p>
                  <div className="bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img src="/placeholder.svg?height=200&width=500" alt="Quiz Example" className="rounded-lg w-full" />
                  </div>
                </div>
              </div>

              <div className="bg-[#E48D44]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-[#E48D44] opacity-10 rounded-br-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold mb-4 text-[#E48D44] text-xl">Benefits of Quizzes</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Active Learning:</strong> Engage with material actively rather than passively
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Knowledge Assessment:</strong> Identify what you know and what you need to review
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Memory Reinforcement:</strong> Testing helps solidify information in long-term memory
                        </span>
                      </li>
                    </ul>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Confidence Building:</strong> Track your progress and build confidence in your
                          knowledge
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Exam Preparation:</strong> Practice with quiz formats similar to actual exams
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Spaced Repetition:</strong> Revisit material at optimal intervals for retention
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
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>GENERATING QUIZZES</h2>

          {/* Decorative element */}
          <div className="absolute top-[-30px] left-[-20px] w-16 h-16 bg-[#E48D44] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg">
            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">Creating quizzes in NoteUS is simple and automated.</p>

              <div className="space-y-8">
                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="font-bold mb-4 text-xl text-[#3A5A40] flex items-center">
                    <div className="w-10 h-10 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 text-white">
                      <span className="text-lg">1</span>
                    </div>
                    Method 1: Generate from Document
                  </h4>
                  <p className="text-gray-600 mb-4 text-lg">Create a quiz directly from your document:</p>
                  <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                    <li>Select one or more documents from your file collection</li>
                    <li>Click on the "Quizzes" tab in the top navigation</li>
                    <li>Click "Generate Quiz" button</li>
                    <li>Configure quiz settings (number of questions, difficulty, etc.)</li>
                    <li>Click "Create Quiz" to generate your quiz</li>
                  </ol>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=400"
                      alt="Generate from Document"
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
                    Method 2: Generate from Mind Map
                  </h4>
                  <p className="text-gray-600 mb-4 text-lg">
                    Create a quiz based on specific concepts in your mind map:
                  </p>
                  <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                    <li>Open a mind map of your document</li>
                    <li>Select one or more nodes in the mind map</li>
                    <li>Right-click and choose "Create Quiz from Selection"</li>
                    <li>Configure quiz settings</li>
                    <li>Click "Create Quiz" to generate your quiz</li>
                  </ol>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=400"
                      alt="Generate from Mind Map"
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
                    Method 3: Generate from Flashcards
                  </h4>
                  <p className="text-gray-600 mb-4 text-lg">Convert your flashcard deck into a quiz:</p>
                  <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                    <li>Go to the "Flashcards" tab</li>
                    <li>Select a flashcard deck</li>
                    <li>Click the three dots menu and select "Create Quiz from Deck"</li>
                    <li>Configure quiz settings</li>
                    <li>Click "Create Quiz" to generate your quiz</li>
                  </ol>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=400"
                      alt="Generate from Flashcards"
                      className="rounded-lg w-full"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.4)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>
            QUIZ SETTINGS AND CUSTOMIZATION
          </h2>

          {/* Decorative element */}
          <div className="absolute top-[-20px] right-[-30px] w-20 h-20 bg-[#86AB5D] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg relative">
            {/* Decorative top corner */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E48D44] opacity-5 rounded-bl-full"></div>

            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md mb-8 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Customizing Your Quiz</h4>
                  </div>
                  <p className="text-gray-600 mb-4 text-lg">NoteUS offers several options to customize your quizzes:</p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-[20px] border border-[#86AB5D]/20 shadow-sm">
                      <h5 className="font-bold text-lg mb-3 text-[#86AB5D]">Question Types</h5>
                      <ul className="space-y-2 pl-4">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                          Multiple choice
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                          True/False
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                          Fill in the blank
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                          Short answer
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                          Matching
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white p-5 rounded-[20px] border border-[#E48D44]/20 shadow-sm">
                      <h5 className="font-bold text-lg mb-3 text-[#E48D44]">Difficulty Levels</h5>
                      <ul className="space-y-2 pl-4">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                          Easy - Basic recall questions
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                          Medium - Application questions
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                          Hard - Analysis and synthesis questions
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                          Mixed - Combination of all levels
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-[#E48D44] opacity-10 rounded-br-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold mb-4 text-xl text-[#3A5A40]">Additional Settings</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-[20px] border border-[#86AB5D]/20 shadow-sm">
                      <h5 className="font-bold text-lg mb-3 text-[#86AB5D]">Quiz Format</h5>
                      <ul className="space-y-2 pl-4">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                          <strong>Number of questions:</strong> 5-50
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                          <strong>Time limit:</strong> None, or 1-60 minutes
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                          <strong>Question order:</strong> Sequential or random
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                          <strong>Show answers:</strong> After each question or at the end
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white p-5 rounded-[20px] border border-[#E48D44]/20 shadow-sm">
                      <h5 className="font-bold text-lg mb-3 text-[#E48D44]">Content Focus</h5>
                      <ul className="space-y-2 pl-4">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                          <strong>Topic selection:</strong> Focus on specific topics
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                          <strong>Concept weight:</strong> Emphasize important concepts
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                          <strong>Previously missed:</strong> Focus on questions you got wrong before
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                          <strong>Comprehensive:</strong> Cover all material evenly
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=500"
                      alt="Quiz Settings"
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
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>TAKING QUIZZES</h2>

          {/* Decorative element */}
          <div className="absolute top-[-30px] left-[-20px] w-16 h-16 bg-[#E48D44] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg">
            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">
                Once you've generated a quiz, you can take it immediately or save it for later.
              </p>

              <div className="space-y-8">
                <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                  <div className="relative z-10">
                    <h4 className="font-bold mb-4 text-xl text-[#3A5A40]">Quiz Interface</h4>
                    <p className="text-gray-600 mb-4 text-lg">
                      The quiz interface is designed to be clean and intuitive:
                    </p>
                    <ul className="space-y-2 pl-4">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                        <strong>Progress indicator:</strong> Shows how many questions you've completed
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                        <strong>Timer:</strong> Displays remaining time (if time limit is set)
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                        <strong>Question display:</strong> Clear presentation of the current question
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                        <strong>Answer options:</strong> Easy-to-select answer choices
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                        <strong>Navigation:</strong> Buttons to move between questions
                      </li>
                    </ul>
                    <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                      <img
                        src="/placeholder.svg?height=200&width=500"
                        alt="Quiz Interface"
                        className="rounded-lg w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-[#E48D44] opacity-10 rounded-br-full"></div>

                  <div className="relative z-10">
                    <h4 className="font-bold mb-4 text-xl text-[#3A5A40]">Quiz Modes</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white p-5 rounded-[20px] border border-[#86AB5D]/20 shadow-sm">
                        <h5 className="font-bold text-lg mb-3 text-[#86AB5D]">Practice Mode</h5>
                        <ul className="space-y-2 pl-4">
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                            No time pressure
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                            See explanations after each answer
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                            Option to retry questions
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                            Progress is saved
                          </li>
                        </ul>
                      </div>
                      <div className="bg-white p-5 rounded-[20px] border border-[#E48D44]/20 shadow-sm">
                        <h5 className="font-bold text-lg mb-3 text-[#E48D44]">Test Mode</h5>
                        <ul className="space-y-2 pl-4">
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                            Optional time limit
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                            No feedback until completion
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                            Simulates exam conditions
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                            Results saved for analysis
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#E48D44]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#E48D44] opacity-10 rounded-tl-full"></div>

                  <div className="relative z-10">
                    <h4 className="font-bold mb-4 text-[#E48D44] text-xl">Quiz-Taking Tips</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>Read each question carefully before answering</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>Use the "flag for review" feature for questions you're unsure about</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>In timed quizzes, don't spend too long on any single question</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>Review explanations carefully to learn from mistakes</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>Take regular quizzes to reinforce your learning over time</span>
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
            QUIZ RESULTS AND ANALYTICS
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
                      <BarChart className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Results Dashboard</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    After completing a quiz, you'll see a detailed results dashboard:
                  </p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Overall score and percentage
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Time taken
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Breakdown of correct and incorrect answers
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Detailed explanations for each question
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Topics that need more review
                    </li>
                  </ul>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=250"
                      alt="Results Dashboard"
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
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Progress Over Time</h4>
                  </div>
                  <p className="text-gray-600 mb-4">Track your improvement with detailed analytics:</p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                      Performance trends across multiple quizzes
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                      Topic-by-topic mastery levels
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                      Comparison with previous attempts
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                      Identification of persistent knowledge gaps
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                      Personalized study recommendations
                    </li>
                  </ul>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=250"
                      alt="Progress Analytics"
                      className="rounded-lg w-full"
                    />
                  </div>
                </motion.div>
              </div>

              <div className="bg-[#86AB5D]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Premium Features</h4>
                  </div>
                  <p className="text-gray-600 mb-4 text-lg">Premium users have access to additional quiz features:</p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Advanced analytics:</strong> Detailed performance metrics and insights
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Custom quiz templates:</strong> Save quiz configurations for future use
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Collaborative quizzes:</strong> Share quizzes with study groups
                        </span>
                      </li>
                    </ul>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>AI-powered recommendations:</strong> Get personalized study suggestions
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Export options:</strong> Save quizzes in various formats (PDF, Word, etc.)
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Integration with LMS:</strong> Connect with learning management systems
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
