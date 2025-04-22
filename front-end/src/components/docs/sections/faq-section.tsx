"use client"

import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

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
    <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeIn("up", 0.1)}>
        <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-700 mb-6">Find answers to common questions about NoteUS and its features.</p>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.2)}>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="mb-6 overflow-x-auto">
              <div className="flex space-x-2 min-w-max">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === category.id
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="border rounded-lg overflow-hidden"
                  variants={fadeIn("up", 0.1 * (index + 1))}
                >
                  <button
                    className={`w-full p-4 text-left flex justify-between items-center ${
                      openIndex === index ? "bg-green-50" : "bg-gray-50"
                    }`}
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="font-medium">{faq.question}</span>
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  {openIndex === index && (
                    <div className="p-4 bg-white">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No FAQs found in this category.</p>
              </div>
            )}

            <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium mb-2 text-blue-800">Still Have Questions?</h4>
              <p className="text-sm text-gray-700 mb-4">
                If you couldn't find the answer you were looking for, our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#"
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="#"
                  className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Visit Help Center
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
