"use client"

import { useState } from "react"
import { Logo } from "@/components/logo"
import AuthUI from "@/components/auth-ui"
import { Button } from "@/components/ui/button"
import { FileText, Brain, FlashlightIcon as FlashIcon, MessageSquare, FileUp } from "lucide-react"

export default function Home() {
  const [showAuth, setShowAuth] = useState(false)

  const handleNavClick = () => {
    setShowAuth(true)
  }

  return (
    <main className="min-h-screen relative">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-green-600" />
          <span className="font-bold text-xl">NoteUS</span>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <button onClick={handleNavClick} className="font-medium hover:text-green-600 transition-colors">
            CHATBOX
          </button>
          <button onClick={handleNavClick} className="font-medium hover:text-green-600 transition-colors">
            FILES
          </button>
          <button onClick={handleNavClick} className="font-medium hover:text-green-600 transition-colors">
            MINDMAP
          </button>
          <button onClick={handleNavClick} className="font-medium hover:text-green-600 transition-colors">
            FLASHCARD
          </button>
          <button onClick={handleNavClick} className="font-medium hover:text-green-600 transition-colors">
            PRICING
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowAuth(true)}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            Sign Up
          </Button>
          <Button onClick={() => setShowAuth(true)} className="bg-green-600 hover:bg-green-700 text-white">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">AI-powered Note-Taking Assistant</h1>
            <p className="text-xl text-gray-600 mb-10">
              Transform your notes with AI-powered organization, summarization, and knowledge extraction. Study smarter,
              not harder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => setShowAuth(true)}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
              >
                Get Started Free
              </Button>
              <Button
                onClick={() => setShowAuth(true)}
                size="lg"
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-6 text-lg"
              >
                See Demo
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
              <img
                src="/NoteUSDashboard.png"
                alt="NoteUS Dashboard Preview"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-green-600" />
            </div>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <Brain className="h-10 w-10 text-blue-600" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features for Modern Note-Taking</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered tools help you organize, understand, and remember information more effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Chat Assistant</h3>
              <p className="text-gray-600">
                Chat with your documents and get instant answers based on your notes and files.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart File Management</h3>
              <p className="text-gray-600">
                Organize and access your files from anywhere with our intuitive file management system.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mind Mapping</h3>
              <p className="text-gray-600">
                Visualize your notes and concepts with interactive mind maps generated from your content.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <FlashIcon className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Flashcards</h3>
              <p className="text-gray-600">Create and study with AI-generated flashcards to reinforce your learning.</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Screenshot Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">See NoteUS in Action</h2>
              <p className="text-xl text-gray-600 mb-8">
                Our intuitive interface makes it easy to organize your thoughts and boost your productivity.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <FileUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Upload Any File</h3>
                    <p className="text-gray-600">
                      Import PDFs, images, and documents to extract and organize information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Chat with Your Notes</h3>
                    <p className="text-gray-600">
                      Ask questions about your content and get accurate answers instantly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Brain className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Generate Mind Maps</h3>
                    <p className="text-gray-600">Visualize connections between concepts for better understanding.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
                <img
                  src="/placeholder.svg?height=600&width=800"
                  alt="NoteUS Interface"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -z-10 -bottom-6 -right-6 w-64 h-64 bg-green-200 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -z-10 -top-6 -left-6 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">What Our Users Say</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
              <p className="mb-6 text-white/90">
                "NoteUS has completely transformed how I study. The AI chat feature helps me understand complex topics,
                and the mind maps make it easy to connect ideas."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-white/70 text-sm">Computer Science Student</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
              <p className="mb-6 text-white/90">
                "As a researcher, I need to organize tons of information. NoteUS helps me keep everything structured and
                accessible. The flashcard feature is a game-changer for memorization."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">David Chen</h4>
                  <p className="text-white/70 text-sm">PhD Candidate</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
              <p className="mb-6 text-white/90">
                "I've tried many note-taking apps, but NoteUS is in a league of its own. The AI capabilities save me
                hours of work every week, and the interface is intuitive and beautiful."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Emily Rodriguez</h4>
                  <p className="text-white/70 text-sm">Marketing Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your note-taking?</h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of students and professionals who are already using NoteUS to study smarter.
          </p>
          <Button
            onClick={() => setShowAuth(true)}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
          >
            Get Started — It's Free
          </Button>
        </div>
      </section>

      {/* Integration Partners */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-500 mb-8">Works with your favorite platforms</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">Google</div>
            <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">YouTube</div>
            <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">Notion</div>
            <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">Evernote</div>
            <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">Dropbox</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo className="h-8 w-8 text-green-500" />
                <span className="font-bold text-xl text-white">NoteUS</span>
              </div>
              <p className="text-sm">Your AI-powered note-taking assistant that helps you study smarter, not harder.</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" onClick={handleNavClick} className="hover:text-white transition-colors">
                    AI Chat
                  </a>
                </li>
                <li>
                  <a href="#" onClick={handleNavClick} className="hover:text-white transition-colors">
                    File Management
                  </a>
                </li>
                <li>
                  <a href="#" onClick={handleNavClick} className="hover:text-white transition-colors">
                    Mind Mapping
                  </a>
                </li>
                <li>
                  <a href="#" onClick={handleNavClick} className="hover:text-white transition-colors">
                    Flashcards
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" onClick={handleNavClick} className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" onClick={handleNavClick} className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" onClick={handleNavClick} className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" onClick={handleNavClick} className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" onClick={handleNavClick} className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" onClick={handleNavClick} className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" onClick={handleNavClick} className="hover:text-white transition-colors">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} NoteUS. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal Overlay */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuth(false)}></div>
          <div className="z-10 w-full max-w-md">
            <AuthUI />
            <button
              onClick={() => setShowAuth(false)}
              className="mt-4 text-white hover:underline text-sm mx-auto block"
            >
              Return to homepage
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

