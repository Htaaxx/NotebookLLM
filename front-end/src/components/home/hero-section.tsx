"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { fadeIn, slideIn, zoomIn } from "@/lib/motion-utils"

interface HeroSectionProps {
  onGetStarted: () => void
  onSeeDemo: () => void
}

export function HeroSection({ onGetStarted, onSeeDemo }: HeroSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleSeeDemo = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    }
    onSeeDemo()
  }

  return (
    <motion.div
      className="relative bg-gradient-to-b from-white to-gray-50 py-20 overflow-hidden"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Hero Content */}
          <motion.div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0" variants={fadeIn("right", 0.2)}>
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              variants={fadeIn("up", 0.3)}
            >
              Transform Your <span className="text-green-600">Notes</span> into Knowledge
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0"
              variants={fadeIn("up", 0.4)}
            >
              Upload your notes, ask questions, and get instant answers. Create flashcards, quizzes, and mind maps to
              enhance your learning.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              variants={fadeIn("up", 0.5)}
            >
              <Button
                onClick={onGetStarted}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
              >
                Get Started
              </Button>
              <Button
                onClick={handleSeeDemo}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 rounded-lg text-lg font-medium"
              >
                See Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero Video/Image */}
          <motion.div className="lg:w-1/2" variants={zoomIn(0.4, 1)}>
            <div className="relative rounded-lg shadow-2xl overflow-hidden">
              {/* Placeholder image that will be replaced by video when playing */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
                  <div className="w-16 h-16 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-green-600 ml-1"></div>
                  </div>
                </div>
              )}

              {/* Video element */}
              <video
                ref={videoRef}
                className="w-full h-auto rounded-lg"
                poster="/NoteUS.jpg"
                controls={isPlaying}
                onEnded={() => setIsPlaying(false)}
                playsInline
              >
                <source src="/noteUS_demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Decorative Elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20"
        variants={slideIn("down", "spring", 0.2, 1)}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20"
        variants={slideIn("up", "spring", 0.4, 1)}
      />
    </motion.div>
  )
}

