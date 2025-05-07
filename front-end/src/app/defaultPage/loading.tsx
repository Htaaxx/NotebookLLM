import { Loader2, MessageSquare } from "lucide-react"

export default function Loading() {
  // This component will simulate a longer loading time
  // to make the loading screen more visible
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#86AB5D]">
      <div className="text-center">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-[#F2F5DA] mb-4" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <MessageSquare className="h-6 w-6 text-[#E48D44]" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Loading Dashboard</h2>
        <p className="text-md text-[#E7E7C9]">Preparing your workspace...</p>
        <div className="flex items-center justify-center mt-4 space-x-2">
          <div className="h-2 w-2 bg-[#E48D44] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="h-2 w-2 bg-[#E48D44] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="h-2 w-2 bg-[#E48D44] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  )
}