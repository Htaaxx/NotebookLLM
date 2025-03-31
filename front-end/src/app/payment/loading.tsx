import { Loader2, CreditCard } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-emerald-600 mb-4" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <CreditCard className="h-6 w-6 text-emerald-800" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Payment</h2>
        <p className="text-md text-gray-600">Preparing secure payment environment...</p>
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-emerald-600 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-emerald-600 rounded-full animate-pulse delay-75"></div>
            <div className="w-3 h-3 bg-emerald-600 rounded-full animate-pulse delay-150"></div>
            <div className="w-3 h-3 bg-emerald-600 rounded-full animate-pulse delay-300"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

