"use client"

import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"
import { useState } from "react"
import { Anton } from "next/font/google"

// Initialize Anton font
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

interface FAQItem {
  question: string
  answer: string
  category: string
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const faqItems: FAQItem[] = [
    {
      question: "What is NoteUS?",
      answer:
        "NoteUS is an AI-powered note-taking assistant that helps you transform your notes into knowledge. It allows you to upload documents, ask questions about your content, generate mind maps, create flashcards, and test your knowledge with quizzes.",
      category: "general",
    },
    {
      question: "What file formats does NoteUS support?",
      answer:
        "NoteUS supports various file formats including PDFs, Word documents (.docx, .doc), text files (.txt), images (.jpg, .png), Markdown files (.md), and CSV files (.csv). The maximum file size is 10MB for free accounts and 50MB for premium accounts.",
      category: "files",
    },
    {
      question: "How does the AI chat feature work?",
      answer:
        "The AI chat feature allows you to ask questions about your uploaded documents. Our AI analyzes your content and provides accurate answers based on the information in your files. You can ask factual questions, request explanations of concepts, get summaries, and more.",
      category: "ai",
    },
    {
      question: "Can I use NoteUS offline?",
      answer:
        "The web version of NoteUS requires an internet connection to function. However, premium users can access their flashcards offline through our mobile app, which syncs when you're back online.",
      category: "general",
    },
    {
      question: "How are mind maps generated?",
      answer:
        "Our AI analyzes your document and identifies key concepts, their relationships, and hierarchies. It then organizes this information into a visual mind map with the main topic at the center and related subtopics branching outward. You can customize the appearance and layout of your mind maps.",
      category: "mindmaps",
    },
    {
      question: "How accurate are the AI-generated flashcards and quizzes?",
      answer:
        "Our AI is trained to identify key concepts and create effective study materials. However, we recommend reviewing AI-generated content for accuracy. You can easily edit any flashcards or quiz questions that need adjustment.",
      category: "study",
    },
    {
      question: "What's the difference between free and premium accounts?",
      answer:
        "Free accounts include basic features with some limitations, such as a maximum of 10 documents, 3 mind maps per month, and 50 flashcards. Premium accounts offer unlimited documents, unlimited mind maps and flashcards, advanced analytics, collaborative features, priority processing, and more.",
      category: "account",
    },
    {
      question: "How secure is my data on NoteUS?",
      answer:
        "We take data security seriously. All your documents and data are encrypted both in transit and at rest. We use industry-standard security practices and never share your content with third parties. You can delete your data at any time from your account settings.",
      category: "account",
    },
    {
      question: "Can I share my mind maps and flashcards with others?",
      answer:
        "Yes, premium users can share mind maps and flashcard decks with others through shareable links. You can also collaborate on mind maps and flashcard decks with team members or study groups.",
      category: "collaboration",
    },
    {
      question: "How do I cancel my subscription?",
      answer:
        "You can cancel your subscription at any time from your Account Settings > Subscription page. After cancellation, you'll continue to have access to premium features until the end of your current billing period.",
      category: "account",
    },
    {
      question: "Is there a mobile app for NoteUS?",
      answer:
        "Yes, we offer mobile apps for iOS and Android that allow you to access your documents, mind maps, and flashcards on the go. The mobile app syncs with your web account, so your content is always up to date across all your devices.",
      category: "general",
    },
    {
      question: "How can I get help if I'm having issues with NoteUS?",
      answer:
        "You can access our help center from the Help menu, which contains detailed guides and troubleshooting tips. If you need further assistance, you can contact our support team through the Help > Contact Support option or by emailing support@noteus.com.",
      category: "general",
    },
  ]

  const categories = [
    { id: "all", name: "All Questions" },
    { id: "general", name: "General" },
    { id: "files", name: "File Management" },
    { id: "ai", name: "AI Chat" },
    { id: "mindmaps", name: "Mind Maps" },
    { id: "study", name: "Flashcards & Quizzes" },
    { id: "account", name: "Account & Billing" },
    { id: "collaboration", name: "Sharing & Collaboration" },
  ]

  const filteredFAQs = activeCategory === "all" ? faqItems : faqItems.filter((item) => item.category === activeCategory)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" animate="show" className="space-y-12">
      <motion.div variants={fadeIn("up", 0.1)}>
        <h1 className={`${anton.className} text-5xl font-bold mb-6 text-[#86AB5D]`}>FREQUENTLY ASKED QUESTIONS</h1>
        <p className="text-lg text-gray-700 mb-6" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          Find answers to common questions about NoteUS and its features.
        </p>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.2)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>BROWSE BY CATEGORY</h2>

          {/* Decorative element */}
          <div className="absolute top-[-20px] right-[-30px] w-20 h-20 bg-[#86AB5D] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg relative">
            {/* Decorative top corner */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E48D44] opacity-5 rounded-bl-full"></div>

            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <div className="mb-8 overflow-x-auto">
                <div className="flex space-x-3 min-w-max">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`px-4 py-3 rounded-full text-sm font-bold transition-colors ${
                        activeCategory === category.id
                          ? "bg-[#86AB5D] text-white"
                          : "bg-[#F2F5DA] text-[#3A5A40] hover:bg-[#E48D44]/20"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {category.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <motion.div
                    key={index}
                    className="border-0 rounded-[30px] overflow-hidden shadow-md"
                    variants={fadeIn("up", 0.1 * (index + 1))}
                    whileHover={{ scale: 1.01 }}
                  >
                    <button
                      className={`w-full p-5 text-left flex justify-between items-center ${
                        openIndex === index ? "bg-[#86AB5D] text-white" : "bg-[#F2F5DA] text-[#3A5A40]"
                      } rounded-t-[30px] font-bold`}
                      onClick={() => toggleFAQ(index)}
                    >
                      <span>{faq.question}</span>
                      {openIndex === index ? (
                        <ChevronUp className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 flex-shrink-0" />
                      )}
                    </button>
                    {openIndex === index && (
                      <div className="p-5 bg-white rounded-b-[30px]">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-12 bg-[#F2F5DA] rounded-[30px]">
                  <p className="text-gray-500 text-lg">No FAQs found in this category.</p>
                </div>
              )}

              <div className="mt-8 bg-[#E48D44]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#E48D44] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold flex items-center mb-4 text-[#E48D44] text-xl">
                    <HelpCircle className="w-6 h-6 mr-3" />
                    Still Have Questions?
                  </h4>
                  <p className="text-gray-700 text-lg mb-6">
                    If you couldn't find the answer you were looking for, our support team is here to help.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.a
                      href="#"
                      className="inline-flex items-center justify-center px-6 py-3 bg-[#86AB5D] text-white rounded-full text-base font-bold hover:bg-[#86AB5D]/90 transition-colors shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Contact Support
                    </motion.a>
                    <motion.a
                      href="#"
                      className="inline-flex items-center justify-center px-6 py-3 bg-[#F2F5DA] border border-[#86AB5D]/30 text-[#3A5A40] rounded-full text-base font-bold hover:bg-[#F2F5DA]/70 transition-colors shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Visit Help Center
                    </motion.a>
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
