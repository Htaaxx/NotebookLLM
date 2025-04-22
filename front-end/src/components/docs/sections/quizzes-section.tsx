"use client"

import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"
import { ClipboardCheck, Settings, BarChart, Clock, Award } from "lucide-react"

export function QuizzesSection() {
  return (
    <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeIn("up", 0.1)}>
        <h1 className="text-3xl font-bold mb-4">Quizzes</h1>
        <p className="text-lg text-gray-700 mb-6">
          Learn how to use the quiz feature to test your knowledge and reinforce your learning.
        </p>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.2)}>
        <h2 className="text-xl font-semibold mb-4">Understanding Quizzes</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Quizzes in NoteUS are automatically generated from your documents to help you test your understanding and
              identify knowledge gaps.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center mb-3">
                <ClipboardCheck className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium">How Quizzes Work</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Our AI analyzes your documents and creates various types of questions to test your knowledge. You can
                take quizzes, receive immediate feedback, and track your progress over time.
              </p>
              <img
                src="/placeholder.svg?height=200&width=500"
                alt="Quiz Example"
                className="rounded-lg border w-full"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium mb-2 text-blue-800">Benefits of Quizzes</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>
                  <strong>Active Learning:</strong> Engage with material actively rather than passively
                </li>
                <li>
                  <strong>Knowledge Assessment:</strong> Identify what you know and what you need to review
                </li>
                <li>
                  <strong>Memory Reinforcement:</strong> Testing helps solidify information in long-term memory
                </li>
                <li>
                  <strong>Confidence Building:</strong> Track your progress and build confidence in your knowledge
                </li>
                <li>
                  <strong>Exam Preparation:</strong> Practice with quiz formats similar to actual exams
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.3)}>
        <h2 className="text-xl font-semibold mb-4">Generating Quizzes</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 mb-4">Creating quizzes in NoteUS is simple and automated.</p>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Method 1: Generate from Document</h4>
                <p className="text-sm text-gray-600 mb-3">Create a quiz directly from your document:</p>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                  <li>Select one or more documents from your file collection</li>
                  <li>Click on the "Quizzes" tab in the top navigation</li>
                  <li>Click "Generate Quiz" button</li>
                  <li>Configure quiz settings (number of questions, difficulty, etc.)</li>
                  <li>Click "Create Quiz" to generate your quiz</li>
                </ol>
                <img
                  src="/placeholder.svg?height=150&width=400"
                  alt="Generate from Document"
                  className="rounded-lg border w-full mt-3"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Method 2: Generate from Mind Map</h4>
                <p className="text-sm text-gray-600 mb-3">Create a quiz based on specific concepts in your mind map:</p>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                  <li>Open a mind map of your document</li>
                  <li>Select one or more nodes in the mind map</li>
                  <li>Right-click and choose "Create Quiz from Selection"</li>
                  <li>Configure quiz settings</li>
                  <li>Click "Create Quiz" to generate your quiz</li>
                </ol>
                <img
                  src="/placeholder.svg?height=150&width=400"
                  alt="Generate from Mind Map"
                  className="rounded-lg border w-full mt-3"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Method 3: Generate from Flashcards</h4>
                <p className="text-sm text-gray-600 mb-3">Convert your flashcard deck into a quiz:</p>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                  <li>Go to the "Flashcards" tab</li>
                  <li>Select a flashcard deck</li>
                  <li>Click the three dots menu and select "Create Quiz from Deck"</li>
                  <li>Configure quiz settings</li>
                  <li>Click "Create Quiz" to generate your quiz</li>
                </ol>
                <img
                  src="/placeholder.svg?height=150&width=400"
                  alt="Generate from Flashcards"
                  className="rounded-lg border w-full mt-3"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.4)}>
        <h2 className="text-xl font-semibold mb-4">Quiz Settings and Customization</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center mb-3">
                <Settings className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium">Customizing Your Quiz</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">NoteUS offers several options to customize your quizzes:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-sm mb-2">Question Types</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    <li>Multiple choice</li>
                    <li>True/False</li>
                    <li>Fill in the blank</li>
                    <li>Short answer</li>
                    <li>Matching</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-2">Difficulty Levels</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    <li>Easy - Basic recall questions</li>
                    <li>Medium - Application questions</li>
                    <li>Hard - Analysis and synthesis questions</li>
                    <li>Mixed - Combination of all levels</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Additional Settings</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-sm mb-2">Quiz Format</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    <li>
                      <strong>Number of questions:</strong> 5-50
                    </li>
                    <li>
                      <strong>Time limit:</strong> None, or 1-60 minutes
                    </li>
                    <li>
                      <strong>Question order:</strong> Sequential or random
                    </li>
                    <li>
                      <strong>Show answers:</strong> After each question or at the end
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-2">Content Focus</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    <li>
                      <strong>Topic selection:</strong> Focus on specific topics
                    </li>
                    <li>
                      <strong>Concept weight:</strong> Emphasize important concepts
                    </li>
                    <li>
                      <strong>Previously missed:</strong> Focus on questions you got wrong before
                    </li>
                    <li>
                      <strong>Comprehensive:</strong> Cover all material evenly
                    </li>
                  </ul>
                </div>
              </div>
              <img
                src="/placeholder.svg?height=150&width=500"
                alt="Quiz Settings"
                className="rounded-lg border w-full mt-4"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.5)}>
        <h2 className="text-xl font-semibold mb-4">Taking Quizzes</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Once you've generated a quiz, you can take it immediately or save it for later.
            </p>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Quiz Interface</h4>
                <p className="text-sm text-gray-600 mb-3">The quiz interface is designed to be clean and intuitive:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>
                    <strong>Progress indicator:</strong> Shows how many questions you've completed
                  </li>
                  <li>
                    <strong>Timer:</strong> Displays remaining time (if time limit is set)
                  </li>
                  <li>
                    <strong>Question display:</strong> Clear presentation of the current question
                  </li>
                  <li>
                    <strong>Answer options:</strong> Easy-to-select answer choices
                  </li>
                  <li>
                    <strong>Navigation:</strong> Buttons to move between questions
                  </li>
                </ul>
                <img
                  src="/placeholder.svg?height=200&width=500"
                  alt="Quiz Interface"
                  className="rounded-lg border w-full mt-3"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Quiz Modes</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Practice Mode</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      <li>No time pressure</li>
                      <li>See explanations after each answer</li>
                      <li>Option to retry questions</li>
                      <li>Progress is saved</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-2">Test Mode</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      <li>Optional time limit</li>
                      <li>No feedback until completion</li>
                      <li>Simulates exam conditions</li>
                      <li>Results saved for analysis</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-medium mb-2 text-blue-800">Quiz-Taking Tips</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Read each question carefully before answering</li>
                  <li>Use the "flag for review" feature for questions you're unsure about</li>
                  <li>In timed quizzes, don't spend too long on any single question</li>
                  <li>Review explanations carefully to learn from mistakes</li>
                  <li>Take regular quizzes to reinforce your learning over time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.6)}>
        <h2 className="text-xl font-semibold mb-4">Quiz Results and Analytics</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <BarChart className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium">Results Dashboard</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  After completing a quiz, you'll see a detailed results dashboard:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Overall score and percentage</li>
                  <li>Time taken</li>
                  <li>Breakdown of correct and incorrect answers</li>
                  <li>Detailed explanations for each question</li>
                  <li>Topics that need more review</li>
                </ul>
                <img
                  src="/placeholder.svg?height=150&width=250"
                  alt="Results Dashboard"
                  className="rounded-lg border w-full mt-3"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Clock className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium">Progress Over Time</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">Track your improvement with detailed analytics:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Performance trends across multiple quizzes</li>
                  <li>Topic-by-topic mastery levels</li>
                  <li>Comparison with previous attempts</li>
                  <li>Identification of persistent knowledge gaps</li>
                  <li>Personalized study recommendations</li>
                </ul>
                <img
                  src="/placeholder.svg?height=150&width=250"
                  alt="Progress Analytics"
                  className="rounded-lg border w-full mt-3"
                />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center mb-3">
                <Award className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium">Premium Features</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">Premium users have access to additional quiz features:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>
                  <strong>Advanced analytics:</strong> Detailed performance metrics and insights
                </li>
                <li>
                  <strong>Custom quiz templates:</strong> Save quiz configurations for future use
                </li>
                <li>
                  <strong>Collaborative quizzes:</strong> Share quizzes with study groups
                </li>
                <li>
                  <strong>AI-powered recommendations:</strong> Get personalized study suggestions
                </li>
                <li>
                  <strong>Export options:</strong> Save quizzes in various formats (PDF, Word, etc.)
                </li>
                <li>
                  <strong>Integration with LMS:</strong> Connect with learning management systems
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
