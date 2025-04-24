"use client"

import type React from "react"

interface GreenBlockProps {
  children: React.ReactNode
}

export function GreenBlock({ children }: GreenBlockProps) {
  return (
    <div className="relative">
      {/* Green background with specific border radius */}
      <div className="absolute top-0 left-[calc(50%-0px)] w-[50%] h-[45%]">
        <div
          className="absolute top-0 right-0 w-full h-full bg-[#86AB5D]"
          style={{
            borderTopLeftRadius: "50px",
            borderTopRightRadius: "50px",
            borderBottomRightRadius: "50px",
            borderBottomLeftRadius: "80px",
          }}
        >
          {/* Decorative circles */}
          <div className="absolute top-[15%] right-[3%] w-64 h-64 bg-[#518650] rounded-full"></div>
          <div className="absolute bottom-[30%] right-[41%] w-32 h-32 bg-[#E48D44] rounded-full z-20"></div>
          <div className="absolute bottom-[-5%] right-[20%] w-48 h-48 bg-[#3A5A40] rounded-full"></div>
        </div>
      </div>

      {/* Cream-colored section that blends with the green block */}
      <div className="absolute top-[200px] left-[19%] w-[699px] h-[218px] z-10">
        <div
          className="w-full h-full bg-[#F2F5DA] flex justify-end items-center pr-8"
          
          style={{
            borderTopLeftRadius: "50px",
            borderTopRightRadius: "80px",
            borderBottomRightRadius: "80px",
            borderBottomLeftRadius: "50px",
          }}
        >
            <p
            className="text-[16px] md:text-[16px] text-black max-w-[550px] mx-auto font-bold text-right"
            style={{
              fontFamily: "'Quicksand', sans-serif",
              marginRight: "15px",
            }}
            >
            Upload your notes, ask questions, and get instant answers. Create flashcards, quizzes, and mind maps to
            enhance your learning.
            </p>
        </div>
      </div>

      {/* Content container */}
      <div className="relative z-20">{children}</div>
    </div>
  )
}
