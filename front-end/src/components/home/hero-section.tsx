"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare, Brain } from "lucide-react"

interface HeroSectionProps {
  onGetStarted: () => void
  onSeeDemo: () => void
}

export function HeroSection({ onGetStarted, onSeeDemo }: HeroSectionProps) {
  return (
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
              onClick={onGetStarted}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
            >
              Get Started Free
            </Button>
            <Button
              onClick={onSeeDemo}
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
            <img src="/NoteUSDashboard.png" alt="NoteUS Dashboard Preview" className="w-full h-full object-contain" />
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
  )
}

