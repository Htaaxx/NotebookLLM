"use client"

import { useState, useRef } from "react"

interface HeroSectionProps {
  onGetStarted: () => void
  onSeeDemo: () => void
}

export function HeroSection({ onGetStarted, onSeeDemo }: HeroSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoSectionRef = useRef<HTMLDivElement>(null)

  const handleSeeDemo = () => {
    // Play video if available
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    }

    // Scroll to video section
    if (videoSectionRef.current) {
      videoSectionRef.current.scrollIntoView({ behavior: "smooth" })
    }

    onSeeDemo()
  }

  const scrollToVideo = () => {
    // Scroll to video section
    if (videoSectionRef.current) {
      videoSectionRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero content */}
      <div className="px-8 mb-16 mt-9">
        <div className="max-w-[1062px]">
          {/* Transform Your */}
          <h1
            className="text-[60px] md:text-[80px] text-[#86AB5D] font-normal leading-tight"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            TRANSFORM YOUR
          </h1>

          {/* Notes */}
          <h1
            className="text-[90px] md:text-[135px] text-[#E48D44] font-normal leading-tight -mt-4 md:-mt-2"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            NOTES
          </h1>

          {/* Into Knowledge */}
          <h1
            className="text-[60px] md:text-[80px] text-[#86AB5D] font-normal leading-tight -mt-4 md:mt-2"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            INTO KNOWLEDGE
          </h1>

          {/* Description - positioned in the cream-colored section */}

        </div>

        {/* See Demo Button and Arrow - Positioned to the right */}
        <div className="mt-16 flex justify-start items-center pl-[3.75rem] md:pl-[0rem]">
          <div className="flex items-center">
            <button
              onClick={handleSeeDemo}
              className="text-[#86AB5D] text-[20px] md:text-[32px] font-bold hover:underline mr-4"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              SEE DEMO
            </button>

            <button
              onClick={scrollToVideo}
              className="w-12 h-12 bg-[#E48D44] rounded-full flex items-center
               justify-center hover:bg-[#d9a862] transition-colors mr-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10L12 15L17 10"
                  stroke="white" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div ref={videoSectionRef} className="mt-32 px-8 mb-8">
        <div
          className="max-w-12xl mx-auto overflow-hidden"
          style={{
            backgroundColor: "#86AB5D",
            borderTopLeftRadius: "50px",
            borderTopRightRadius: "118px",
            borderBottomRightRadius: "50px",
            borderBottomLeftRadius: "80px",
            aspectRatio: "16/9",
          }}
        >
          {!isPlaying ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <span className="text-white text-4xl font-bold">VIDEO</span>
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.play()
                    setIsPlaying(true)
                  }
                }}
                className="absolute inset-0 w-full h-full cursor-pointer"
              />
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              controls
              onEnded={() => setIsPlaying(false)}
              playsInline
            >
              <source src="/noteUS_demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>

      {/* Get Started Button */}
      <div className="flex justify-center mb-16">
        <button
          onClick={onGetStarted}
          className="bg-[#86AB5D] text-white px-8 py-3 rounded-full text-lg font-bold hover:bg-[#7a9d53] transition-colors"
        >
          GET STARTED
        </button>
      </div>
    </div>
  )
}
