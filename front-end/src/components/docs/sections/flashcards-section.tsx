"use client"

import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"
import { FlipHorizontal, Plus, Edit, Trash2, Clock, BarChart, Lightbulb } from "lucide-react"

export function FlashcardsSection() {
  return (
    <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeIn("up", 0.1)}>
        <h1 className="text-3xl font-bold mb-4">Flashcards</h1>
        <p className="text-lg text-gray-700 mb-6">
          Learn how to use the flashcard feature to create and study digital flashcards generated from your documents.
        </p>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.2)}>
        <h2 className="text-xl font-semibold mb-4">Understanding Flashcards</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Flashcards are a powerful study tool that help you memorize information through active recall. In NoteUS,
              you can automatically generate flashcards from your documents or create them manually.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center mb-3">
                <FlipHorizontal className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium">How Flashcards Work</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Each flashcard has a front side with a question or term, and a back side with the answer or definition.
                You can flip between them to test your knowledge.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded border shadow-sm text-center">
                  <p className="font-medium">Front Side</p>
                  <div className="h-24 flex items-center justify-center border-t mt-2 pt-2">
                    <p>What is photosynthesis?</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded border shadow-sm text-center">
                  <p className="font-medium">Back Side</p>
                  <div className="h-24 flex items-center justify-center border-t mt-2 pt-2 text-sm">
                    <p>
                      The process by which green plants and some other organisms use sunlight to synthesize foods with
                      the help of chlorophyll.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium flex items-center mb-2">
                <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
                Benefits of Flashcards
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>
                  <strong>Active Recall:</strong> Testing yourself strengthens memory more than passive reading
                </li>
                <li>
                  <strong>Spaced Repetition:</strong> Review cards at optimal intervals for long-term retention
                </li>
                <li>
                  <strong>Focus on Weak Areas:</strong> Spend more time on difficult concepts
                </li>
                <li>
                  <strong>Portable Learning:</strong> Study anywhere, anytime on your device
                </li>
                <li>
                  <strong>Progress Tracking:</strong> Monitor your improvement over time
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.3)}>
        <h2 className="text-xl font-semibold mb-4">Creating Flashcards</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 mb-4">There are several ways to create flashcards in NoteUS:</p>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Method 1: AI-Generated Flashcards</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Let our AI automatically create flashcards from your selected document.
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                  <li>Select a document from your file collection</li>
                  <li>Click on the "Flashcards" tab in the top navigation</li>
                  <li>Click "Generate Flashcards" button</li>
                  <li>Choose the number of flashcards you want to create</li>
                  <li>Review and edit the generated flashcards as needed</li>
                </ol>
                <img
                  src="/placeholder.svg?height=150&width=400"
                  alt="AI-Generated Flashcards"
                  className="rounded-lg border w-full mt-3"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Method 2: Create from Mind Map</h4>
                <p className="text-sm text-gray-600 mb-3">Generate flashcards directly from your mind map nodes.</p>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                  <li>Open a mind map of your document</li>
                  <li>Select one or more nodes in the mind map</li>
                  <li>Right-click and choose "Create Flashcards from Selection"</li>
                  <li>Review and edit the generated flashcards</li>
                  <li>Save to your flashcard deck</li>
                </ol>
                <img
                  src="/placeholder.svg?height=150&width=400"
                  alt="Create from Mind Map"
                  className="rounded-lg border w-full mt-3"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Method 3: Create Manually</h4>
                <p className="text-sm text-gray-600 mb-3">Create custom flashcards from scratch.</p>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                  <li>Go to the "Flashcards" tab</li>
                  <li>Click "New Deck" to create a new flashcard deck</li>
                  <li>Name your deck and click "Create"</li>
                  <li>Click "Add Card" to create a new flashcard</li>
                  <li>Enter the front (question) and back (answer) content</li>
                  <li>Save your card and repeat as needed</li>
                </ol>
                <div className="flex items-center justify-center mt-3">
                  <div className="flex items-center justify-center gap-2 bg-white p-2 rounded border">
                    <Plus className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Add Card</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.4)}>
        <h2 className="text-xl font-semibold mb-4">Managing Flashcard Decks</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Edit className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium">Editing Decks</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">You can edit your flashcard decks at any time:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Rename decks</li>
                  <li>Add new cards</li>
                  <li>Edit existing cards</li>
                  <li>Reorder cards</li>
                  <li>Add tags for organization</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Trash2 className="w-5 h-5 text-red-600 mr-2" />
                  <h4 className="font-medium">Deleting Cards/Decks</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">To delete cards or entire decks:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Select a card and click the trash icon</li>
                  <li>To delete a deck, click the three dots menu next to the deck name and select "Delete"</li>
                  <li>Confirm deletion when prompted</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Plus className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-medium">Combining Decks</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">You can merge multiple decks:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Go to the "Flashcards" tab</li>
                  <li>Click "Combine Decks"</li>
                  <li>Select the decks you want to merge</li>
                  <li>Name your new combined deck</li>
                  <li>Click "Combine" to create the new deck</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h4 className="font-medium mb-2 text-yellow-800">Important Note</h4>
              <p className="text-sm text-gray-700">
                Deleted flashcards and decks cannot be recovered. Consider exporting important decks before deleting
                them.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.5)}>
        <h2 className="text-xl font-semibold mb-4">Studying with Flashcards</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 mb-4">NoteUS offers several study modes to help you learn effectively:</p>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Standard Study Mode</h4>
                <p className="text-sm text-gray-600 mb-3">The basic flashcard study mode:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Select a deck to study</li>
                  <li>Cards are shown one at a time</li>
                  <li>Click or tap to flip between question and answer</li>
                  <li>Use arrow buttons or swipe to move between cards</li>
                  <li>Mark cards as "Known" or "Need Review" as you go</li>
                </ul>
                <img
                  src="/placeholder.svg?height=150&width=400"
                  alt="Standard Study Mode"
                  className="rounded-lg border w-full mt-3"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Clock className="w-5 h-5 text-purple-600 mr-2" />
                  <h4 className="font-medium">Spaced Repetition Mode</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  An advanced study method that shows cards at optimal intervals for long-term retention:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Cards you find difficult appear more frequently</li>
                  <li>Cards you know well appear less frequently</li>
                  <li>Rate your confidence after each card (1-5 scale)</li>
                  <li>The system adjusts review intervals based on your ratings</li>
                  <li>Receive daily study recommendations</li>
                </ul>
                <img
                  src="/placeholder.svg?height=150&width=400"
                  alt="Spaced Repetition Mode"
                  className="rounded-lg border w-full mt-3"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <BarChart className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium">Progress Tracking</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">Monitor your learning progress:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>View statistics for each deck</li>
                  <li>See your accuracy rate for each card</li>
                  <li>Track your study streak</li>
                  <li>Identify your most challenging cards</li>
                  <li>Set and monitor study goals</li>
                </ul>
                <img
                  src="/placeholder.svg?height=150&width=400"
                  alt="Progress Tracking"
                  className="rounded-lg border w-full mt-3"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.6)}>
        <h2 className="text-xl font-semibold mb-4">Tips for Effective Flashcard Learning</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h4 className="font-medium mb-2 text-green-800">Best Practices</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>
                  <strong>Keep cards simple:</strong> One concept per card is more effective than cramming multiple
                  facts.
                </li>
                <li>
                  <strong>Use images:</strong> Adding relevant images can improve memory retention.
                </li>
                <li>
                  <strong>Study regularly:</strong> Short, frequent study sessions are more effective than cramming.
                </li>
                <li>
                  <strong>Test yourself:</strong> Try to recall the answer before flipping the card.
                </li>
                <li>
                  <strong>Use spaced repetition:</strong> This scientifically-proven method optimizes your study time.
                </li>
                <li>
                  <strong>Review difficult cards:</strong> Focus more time on cards you find challenging.
                </li>
                <li>
                  <strong>Create connections:</strong> Try to relate new information to things you already know.
                </li>
              </ul>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">For Premium Users</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Premium accounts have access to additional flashcard features:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Unlimited flashcard decks</li>
                  <li>Advanced statistics and insights</li>
                  <li>Audio pronunciation for language learning</li>
                  <li>Collaborative decks for group study</li>
                  <li>Export decks in various formats</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Mobile Study</h4>
                <p className="text-sm text-gray-600 mb-3">Study your flashcards anywhere:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Access your flashcards on any device</li>
                  <li>Study offline with the mobile app</li>
                  <li>Sync progress across all your devices</li>
                  <li>Set study reminders</li>
                  <li>Use voice commands for hands-free studying</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
