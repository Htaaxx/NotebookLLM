import { Loader2, CreditCard } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-green-600 mb-4" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <CreditCard className="h-6 w-6 text-green-800" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Payment</h2>
        <p className="text-md text-gray-600">Preparing payment information...</p>
        <div className="flex items-center justify-center mt-4 space-x-2">
          <div className="h-2 w-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="h-2 w-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="h-2 w-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  )
}

