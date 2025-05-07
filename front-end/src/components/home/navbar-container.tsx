"use client"

import type React from "react"

interface NavbarContainerProps {
  children: React.ReactNode
}

export function NavbarContainer({ children }: NavbarContainerProps) {
  return (
    <div className="relative w-full">
      {/* Green outer oval */}
      <div className="absolute inset-0 bg-[#86AB5D] rounded-[80px] "></div>

      {/* Cream inner oval */}
      <div className="absolute top-[10px] left-[10px] right-[10px] bottom-[10px] bg-[#F2F5DA] rounded-[70px]"></div>

      {/* Content */}
      <div className="relative z-10 px-6 py-4">{children}</div>
    </div>
  )
}

export default NavbarContainer
