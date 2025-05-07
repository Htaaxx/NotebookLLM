"use client"

import type React from "react"
import { useState } from "react"
import { MessageSquare, Upload, Network, FlipHorizontal, ClipboardCheck, Sparkles } from "lucide-react"
import { Anton } from "next/font/google"

// Initialize Anton font
const anton = Anton({ 
  weight: "400", 
  subsets: ["latin"],
  display: "swap",
})


type FeatureBox = {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  width: number
  height: number
  top?: number
  left?: number
  borderRadius: string
}

export function FeaturesSection() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  // Adjusted positions to move feature boxes to the left
  const features: FeatureBox[] = [
    {
      id: 1,
      title: "Quizzes",
      description: "Test your knowledge with automatically generated quizzes based on your content.",
      icon: <ClipboardCheck className="w-8 h-8 text-[#F2F5DA]" />,
      width: 170,
      height: 190,
      top: 0,
      left: 0, // Moved to the left edge
      borderRadius: "40px 40px 40px 40px",
    },
    {
      id: 2,
      title: "Upload Any Document",
      description: "Upload PDFs, Word documents, or even YouTube videos to extract and analyze content.",
      icon: <Upload className="w-8 h-8 text-[#F2F5DA]" />,
      width: 427,
      height: 275,
      top: 0,
      left: 180, // Adjusted position
      borderRadius: "40px 40px 40px 40px",
    },
    {
      id: 3,
      title: "Create Mind Maps",
      description: "Visualize concepts and their relationships with automatically generated mind maps.",
      icon: <Network className="w-8 h-8 text-[#F2F5DA]" />,
      width: 204,
      height: 275,
      top: 0,
      left: 617, // Adjusted position
      borderRadius: "40px 40px 40px 40px",
    },
    {
      id: 4,
      title: "Ask Questions",
      description: "Ask questions about your documents and get instant, accurate answers powered by AI.",
      icon: <MessageSquare className="w-8 h-8 text-[#F2F5DA]" />,
      width: 170,
      height: 360,
      top: 200,
      left: 0, // Moved to the left edge
      borderRadius: "40px 40px 40px 40px",
    },
    {
      id: 5,
      title: "AI-Powered Insights",
      description: "Get intelligent summaries, key points, and connections between different documents.",
      icon: <Sparkles className="w-8 h-8 text-[#F2F5DA]" />,
      width: 340,
      height: 275,
      top: 285,
      left: 180, // Adjusted position
      borderRadius: "40px 40px 40px 40px",
    },
    {
      id: 6,
      title: "Flashcards",
      description: "Generate flashcards from your notes to help you memorize key concepts and facts.",
      icon: <FlipHorizontal className="w-8 h-8 text-[#F2F5DA]" />,
      width: 285,
      height: 275,
      top: 285,
      left: 530, // Adjusted position
      borderRadius: "40px 40px 40px 40px",
    },
  ]

  return (
    <section className="py-20 relative overflow-hidden bg-[#F2F5DA]">
      <div className="max-w-[1400px] mx-auto px-6 relative">
        {/* Title and Description - Right side with Anton font */}
        <div className="absolute left-[860px] top-20 max-w-md text-right z-10">
          <h2 className={`${anton.className} text-7xl font-bold mb-8 text-[#E48D44]`}>
            Powerful Features
          </h2>
          <p className="text-2xl text-right leading-relaxed text-gray-700">
            Our platform offers 
            <br />a comprehensive set of tools 
            <br />to help you learn more 
            <br />effectively and efficiently.
          </p>
        </div>

        {/* Features Grid - Left side with Anton font for titles */}
        <div className="relative h-[570px] w-full">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="absolute transition-all duration-300"
              style={{
                width: `${feature.width}px`,
                height: `${feature.height}px`,
                top: feature.top ? `${feature.top}px` : undefined,
                left: feature.left ? `${feature.left}px` : undefined,
                borderRadius: feature.borderRadius,
                overflow: "hidden",
              }}
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              {/* Default State */}
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-opacity duration-300 ${
                  hoveredFeature === feature.id ? "opacity-0" : "opacity-100"
                }`}
                style={{
                  backgroundColor: "#86AB5D",
                  borderRadius: feature.borderRadius,
                }}
              >
                <span className={`${anton.className} text-5xl font-bold text-white absolute top-3 right-6`}>{feature.id}</span>
                <h3 className={`${anton.className} text-3xl font-bold text-[#F2F5DA] text-center mt-auto mb-8`}>{feature.title}</h3>
              </div>

              {/* Hover State */}
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-opacity duration-300 ${
                  hoveredFeature === feature.id ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  backgroundColor: "#E48D44",
                  borderRadius: feature.borderRadius,
                }}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  {feature.icon}
                  <h3 className={`${anton.className} text-xl font-bold text-[#F2F5DA] mt-3 mb-3`}>{feature.title}</h3>
                  <p className="text-white text-center text-sm">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}