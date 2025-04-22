"use client"

import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function GettingStartedSection() {
  return (
    <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeIn("up", 0.1)}>
        <h1 className="text-3xl font-bold mb-4">Getting Started with NoteUS</h1>
        <p className="text-lg text-gray-700 mb-6">
          Welcome to NoteUS! This guide will help you get started with our platform and make the most of its features.
        </p>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.2)} className="bg-gray-50 p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">What is NoteUS?</h2>
        <p className="text-gray-700 mb-4">
          NoteUS is an AI-powered note-taking assistant that helps you transform your notes into knowledge. With NoteUS,
          you can:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Upload and organize your documents</li>
          <li>Ask questions about your content and get instant answers</li>
          <li>Generate mind maps to visualize connections between concepts</li>
          <li>Create flashcards for effective memorization</li>
          <li>Test your knowledge with automatically generated quizzes</li>
        </ul>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.3)}>
        <h2 className="text-xl font-semibold mb-4">Creating Your Account</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-medium">Step 1: Sign Up</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-700 mb-4">
                Click the "Sign Up" button in the top-right corner of the homepage and fill in your details.
              </p>
              <img
                src="/placeholder.svg?height=200&width=300"
                alt="Sign Up Form"
                className="rounded-lg border w-full"
              />
            </div>
          </div>

          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-medium">Step 2: Verify Your Email</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-700 mb-4">
                Check your inbox for a verification email and click the link to activate your account.
              </p>
              <img
                src="/placeholder.svg?height=200&width=300"
                alt="Email Verification"
                className="rounded-lg border w-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.4)}>
        <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              After signing in, you'll be taken to your dashboard. Here's what you'll see:
            </p>
            <img
              src="/placeholder.svg?height=300&width=600"
              alt="Dashboard Overview"
              className="rounded-lg border w-full mb-4"
            />
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">File Collection</h4>
                <p className="text-sm text-gray-600">Upload and organize your documents in the left sidebar.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Chat Interface</h4>
                <p className="text-sm text-gray-600">
                  Ask questions and interact with your documents in the center panel.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">View Options</h4>
                <p className="text-sm text-gray-600">
                  Switch between different views (Preview, Mind Map, Cheatsheet) using the buttons on the right.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.5)} className="bg-green-50 p-6 rounded-xl border border-green-100">
        <h2 className="text-xl font-semibold mb-4">Quick Start Guide</h2>
        <ol className="list-decimal pl-6 space-y-4 text-gray-700">
          <li>
            <strong>Upload a document</strong>: Click the "+" button in the File Collection sidebar to upload your first
            document.
          </li>
          <li>
            <strong>Select your document</strong>: Click on the uploaded file to select it.
          </li>
          <li>
            <strong>Ask a question</strong>: Type a question about your document in the chat interface and press Enter.
          </li>
          <li>
            <strong>Generate a mind map</strong>: Click the mind map icon on the right to visualize the content of your
            document.
          </li>
          <li>
            <strong>Create flashcards</strong>: Use the flashcard feature to generate study materials from your
            document.
          </li>
        </ol>
        <div className="mt-6">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              // Dispatch a custom event to open the auth modal
              window.dispatchEvent(new CustomEvent("openAuthModal"))
            }}
          >
            Explore Features <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.6)}>
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
            <h3 className="font-medium mb-2">Learn About File Management</h3>
            <p className="text-sm text-gray-600 mb-3">Discover how to organize your documents efficiently.</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Set active section to file-management
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("setActiveSection", {
                      detail: { section: "file-management" },
                    }),
                  )
                }
              }}
            >
              File Management Guide
            </Button>
          </div>
          <div className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
            <h3 className="font-medium mb-2">Explore AI Chat</h3>
            <p className="text-sm text-gray-600 mb-3">Learn how to get the most out of the AI chat feature.</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Set active section to ai-chat
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("setActiveSection", {
                      detail: { section: "ai-chat" },
                    }),
                  )
                }
              }}
            >
              AI Chat Guide
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
