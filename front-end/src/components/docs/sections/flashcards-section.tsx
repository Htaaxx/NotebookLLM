"use client"

import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"
import { FlipHorizontal, Plus, Edit, Trash2, Clock, BarChart, Lightbulb } from "lucide-react"
import { Anton } from "next/font/google"

// Initialize Anton font
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export function FlashcardsSection() {
  return (
    <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" animate="show" className="space-y-12">
      <motion.div variants={fadeIn("up", 0.1)}>
        <h1 className={`${anton.className} text-5xl font-bold mb-6 text-[#86AB5D]`}>FLASHCARDS</h1>
        <p className="text-lg text-gray-700 mb-6" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          Learn how to use the flashcard feature to create and study digital flashcards generated from your documents.
        </p>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.2)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>UNDERSTANDING FLASHCARDS</h2>

          {/* Decorative element */}
          <div className="absolute top-[-20px] right-[-30px] w-20 h-20 bg-[#86AB5D] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg relative">
            {/* Decorative top corner */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E48D44] opacity-5 rounded-bl-full"></div>

            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">
                Flashcards are a powerful study tool that help you memorize information through active recall. In
                NoteUS, you can automatically generate flashcards from your documents or create them manually.
              </p>

              <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md mb-8 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                      <FlipHorizontal className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">How Flashcards Work</h4>
                  </div>
                  <p className="text-gray-600 mb-4 text-lg">
                    Each flashcard has a front side with a question or term, and a back side with the answer or
                    definition. You can flip between them to test your knowledge.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      className="bg-white p-6 rounded-[20px] border border-[#86AB5D]/20 shadow-md text-center"
                      whileHover={{ rotateY: 180 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="font-bold mb-3 text-[#86AB5D]">Front Side</p>
                      <div className="h-32 flex items-center justify-center border-t border-[#86AB5D]/10 mt-2 pt-4">
                        <p className="text-xl text-[#3A5A40]">What is photosynthesis?</p>
                      </div>
                    </motion.div>
                    <motion.div
                      className="bg-white p-6 rounded-[20px] border border-[#E48D44]/20 shadow-md text-center"
                      whileHover={{ rotateY: 180 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="font-bold mb-3 text-[#E48D44]">Back Side</p>
                      <div className="h-32 flex items-center justify-center border-t border-[#E48D44]/10 mt-2 pt-4">
                        <p className="text-gray-700">
                          The process by which green plants and some other organisms use sunlight to synthesize foods
                          with the help of chlorophyll.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="bg-[#E48D44]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-[#E48D44] opacity-10 rounded-br-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold flex items-center mb-4 text-[#E48D44] text-xl">
                    <Lightbulb className="w-6 h-6 mr-3" />
                    Benefits of Flashcards
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Active Recall:</strong> Testing yourself strengthens memory more than passive reading
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Spaced Repetition:</strong> Review cards at optimal intervals for long-term retention
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Focus on Weak Areas:</strong> Spend more time on difficult concepts
                        </span>
                      </li>
                    </ul>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Portable Learning:</strong> Study anywhere, anytime on your device
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Progress Tracking:</strong> Monitor your improvement over time
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#E48D44] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Efficient Learning:</strong> Focus on what you need to learn most
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
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>CREATING FLASHCARDS</h2>

          {/* Decorative element */}
          <div className="absolute top-[-30px] left-[-20px] w-16 h-16 bg-[#E48D44] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg">
            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">There are several ways to create flashcards in NoteUS:</p>

              <div className="space-y-8">
                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="font-bold mb-4 text-xl text-[#3A5A40] flex items-center">
                    <div className="w-10 h-10 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 text-white">
                      <span className="text-lg">1</span>
                    </div>
                    Method 1: AI-Generated Flashcards
                  </h4>
                  <p className="text-gray-600 mb-4 text-lg">
                    Let our AI automatically create flashcards from your selected document.
                  </p>
                  <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                    <li>Select a document from your file collection</li>
                    <li>Click on the "Flashcards" tab in the top navigation</li>
                    <li>Click "Generate Flashcards" button</li>
                    <li>Choose the number of flashcards you want to create</li>
                    <li>Review and edit the generated flashcards as needed</li>
                  </ol>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=400"
                      alt="AI-Generated Flashcards"
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
                    Method 2: Create from Mind Map
                  </h4>
                  <p className="text-gray-600 mb-4 text-lg">Generate flashcards directly from your mind map nodes.</p>
                  <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                    <li>Open a mind map of your document</li>
                    <li>Select one or more nodes in the mind map</li>
                    <li>Right-click and choose "Create Flashcards from Selection"</li>
                    <li>Review and edit the generated flashcards</li>
                    <li>Save to your flashcard deck</li>
                  </ol>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=400"
                      alt="Create from Mind Map"
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
                    Method 3: Create Manually
                  </h4>
                  <p className="text-gray-600 mb-4 text-lg">Create custom flashcards from scratch.</p>
                  <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                    <li>Go to the "Flashcards" tab</li>
                    <li>Click "New Deck" to create a new flashcard deck</li>
                    <li>Name your deck and click "Create"</li>
                    <li>Click "Add Card" to create a new flashcard</li>
                    <li>Enter the front (question) and back (answer) content</li>
                    <li>Save your card and repeat as needed</li>
                  </ol>
                  <div className="mt-4 flex items-center justify-center">
                    <motion.div
                      className="flex items-center justify-center gap-2 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20 shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-5 h-5 text-[#86AB5D]" />
                      <span className="text-base font-bold text-[#3A5A40]">Add Card</span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.4)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>MANAGING FLASHCARD DECKS</h2>

          {/* Decorative element */}
          <div className="absolute top-[-20px] right-[-30px] w-20 h-20 bg-[#86AB5D] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg relative">
            {/* Decorative top corner */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E48D44] opacity-5 rounded-bl-full"></div>

            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                      <Edit className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Editing Decks</h4>
                  </div>
                  <p className="text-gray-600 mb-4">You can edit your flashcard decks at any time:</p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Rename decks
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Add new cards
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Edit existing cards
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Reorder cards
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Add tags for organization
                    </li>
                  </ul>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#E48D44] rounded-full flex items-center justify-center mr-4">
                      <Trash2 className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Deleting Cards/Decks</h4>
                  </div>
                  <p className="text-gray-600 mb-4">To delete cards or entire decks:</p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                      Select a card and click the trash icon
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                      To delete a deck, click the three dots menu next to the deck name and select "Delete"
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                      Confirm deletion when prompted
                    </li>
                  </ul>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Combining Decks</h4>
                  </div>
                  <p className="text-gray-600 mb-4">You can merge multiple decks:</p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Go to the "Flashcards" tab
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Click "Combine Decks"
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Select the decks you want to merge
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Name your new combined deck
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Click "Combine" to create the new deck
                    </li>
                  </ul>
                </motion.div>
              </div>

              <div className="bg-[#E48D44]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#E48D44] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold mb-4 text-[#E48D44] text-xl">Important Note</h4>
                  <p className="text-gray-700 text-lg">
                    Deleted flashcards and decks cannot be recovered. Consider exporting important decks before deleting
                    them. You can export your flashcards as PDF, CSV, or in our proprietary format that can be imported
                    back into NoteUS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.5)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>STUDYING WITH FLASHCARDS</h2>

          {/* Decorative element */}
          <div className="absolute top-[-30px] left-[-20px] w-16 h-16 bg-[#E48D44] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg">
            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">
                NoteUS offers several study modes to help you learn effectively:
              </p>

              <div className="space-y-8">
                <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                  <div className="relative z-10">
                    <h4 className="font-bold mb-4 text-xl text-[#3A5A40]">Standard Study Mode</h4>
                    <p className="text-gray-600 mb-4 text-lg">The basic flashcard study mode:</p>
                    <ul className="space-y-2 pl-4">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                        Select a deck to study
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                        Cards are shown one at a time
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                        Click or tap to flip between question and answer
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                        Use arrow buttons or swipe to move between cards
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                        Mark cards as "Known" or "Need Review" as you go
                      </li>
                    </ul>
                    <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                      <img
                        src="/placeholder.svg?height=150&width=400"
                        alt="Standard Study Mode"
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
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold text-xl text-[#3A5A40]">Spaced Repetition Mode</h4>
                    </div>
                    <p className="text-gray-600 mb-4 text-lg">
                      An advanced study method that shows cards at optimal intervals for long-term retention:
                    </p>
                    <ul className="space-y-2 pl-4">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                        Cards you find difficult appear more frequently
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                        Cards you know well appear less frequently
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                        Rate your confidence after each card (1-5 scale)
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                        The system adjusts review intervals based on your ratings
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                        Receive daily study recommendations
                      </li>
                    </ul>
                    <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                      <img
                        src="/placeholder.svg?height=150&width=400"
                        alt="Spaced Repetition Mode"
                        className="rounded-lg w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                        <BarChart className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold text-xl text-[#3A5A40]">Progress Tracking</h4>
                    </div>
                    <p className="text-gray-600 mb-4 text-lg">Monitor your learning progress:</p>
                    <ul className="space-y-2 pl-4">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                        View statistics for each deck
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                        See your accuracy rate for each card
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                        Track your study streak
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                        Identify your most challenging cards
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                        Set and monitor study goals
                      </li>
                    </ul>
                    <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                      <img
                        src="/placeholder.svg?height=150&width=400"
                        alt="Progress Tracking"
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

      <motion.div variants={fadeIn("up", 0.6)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>
            TIPS FOR EFFECTIVE FLASHCARD LEARNING
          </h2>

          {/* Decorative element */}
          <div className="absolute top-[-20px] right-[-30px] w-20 h-20 bg-[#86AB5D] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg relative">
            {/* Decorative top corner */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E48D44] opacity-5 rounded-bl-full"></div>

            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <div className="bg-[#86AB5D]/10 p-6 rounded-[30px] border-0 relative overflow-hidden mb-8">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold mb-4 text-[#86AB5D] text-xl">Best Practices</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Keep cards simple:</strong> One concept per card is more effective than cramming
                          multiple facts.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Use images:</strong> Adding relevant images can improve memory retention.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Study regularly:</strong> Short, frequent study sessions are more effective than
                          cramming.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Test yourself:</strong> Try to recall the answer before flipping the card.
                        </span>
                      </li>
                    </ul>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Use spaced repetition:</strong> This scientifically-proven method optimizes your study
                          time.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Review difficult cards:</strong> Focus more time on cards you find challenging.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-6 h-6 bg-[#86AB5D] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>
                          <strong>Create connections:</strong> Try to relate new information to things you already know.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <h4 className="font-bold mb-4 text-xl text-[#3A5A40]">For Premium Users</h4>
                  <p className="text-gray-600 mb-4">Premium accounts have access to additional flashcard features:</p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                      Unlimited flashcard decks
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                      Advanced statistics and insights
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                      Audio pronunciation for language learning
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                      Collaborative decks for group study
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#E48D44] rounded-full mr-2 flex-shrink-0"></span>
                      Export decks in various formats
                    </li>
                  </ul>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <h4 className="font-bold mb-4 text-xl text-[#3A5A40]">Mobile Study</h4>
                  <p className="text-gray-600 mb-4">Study your flashcards anywhere:</p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Access your flashcards on any device
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Study offline with the mobile app
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Sync progress across all your devices
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Set study reminders
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#86AB5D] rounded-full mr-2 flex-shrink-0"></span>
                      Use voice commands for hands-free studying
                    </li>
                  </ul>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
