"use client"

import { Button } from "@/components/ui/button"

interface CTASectionProps {
  onGetStarted: () => void
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to transform your note-taking?</h2>
        <p className="text-xl text-gray-600 mb-10">
          Join thousands of students and professionals who are already using NoteUS to study smarter.
        </p>
        <Button
          onClick={onGetStarted}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
        >
          Get Started — It's Free
        </Button>
      </div>
    </section>
  )
}

