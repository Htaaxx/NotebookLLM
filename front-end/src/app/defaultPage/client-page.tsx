"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamically import the actual page component with SSR disabled
const DefaultPageContent = dynamic(
  () => import("./page-content"),
  { ssr: false }, // This is the key part - it prevents the component from being rendered on the server
)

// Simple loading component
function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export default function ClientPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DefaultPageContent />
    </Suspense>
  )
}

