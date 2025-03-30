"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/home/footer"
import AuthUI from "@/components/auth-ui"
import { useLanguage } from "@/lib/language-context"
import { plans } from "@/lib/stripe"

export default function PricingPage() {
  const [showAuth, setShowAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [currentPlan, setCurrentPlan] = useState("Free")
  const { language } = useLanguage()
  const isVietnamese = language === "vi"
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("accessToken")
    const storedUsername = localStorage.getItem("username")

    if (token && storedUsername) {
      setIsAuthenticated(true)
      setUserName(storedUsername)

      // In a real app, you would fetch the user's current plan from your backend
      // For now, we'll just use a placeholder
      setCurrentPlan("Free")
    }
  }, [])

  const handleNavClick = () => {
    if (!isAuthenticated) {
      setShowAuth(true)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      setShowAuth(true)
      return
    }

    setIsLoading(true)

    try {
      const selectedPlan = plans.find((plan) => plan.id === planId)

      if (!selectedPlan || !selectedPlan.priceId) {
        if (planId === "free") {
          // Free plan doesn't need payment
          // In a real app, you would update the user's plan in your backend
          setCurrentPlan("Free")
          router.push("/defaultPage")
          return
        }
        throw new Error("Invalid plan selected")
      }

      // Store selected plan in localStorage for the payment page
      localStorage.setItem("selectedPlan", JSON.stringify(selectedPlan))

      // Navigate to payment page
      router.push(`/payment?plan=${planId}`)
    } catch (error) {
      console.error("Error subscribing to plan:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <NavBar />
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the perfect plan for your needs and start transforming your notes today.
            </p>
            {isAuthenticated && (
              <p className="mt-4 text-lg text-green-600">
                You are currently on the <strong>{currentPlan}</strong> plan
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="border-2 border-gray-200 hover:border-gray-300 transition-all">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">Free</CardTitle>
                <CardDescription className="text-lg">
                  {isVietnamese ? "Người mới bắt đầu" : "For beginners"}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-5xl font-bold mb-6">$0</div>
                <ul className="space-y-3 text-left">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {isVietnamese ? "Upload " : "Upload "}
                      <span className="text-blue-500 font-medium">
                        {isVietnamese ? "file pdf, video dưới 5 phút" : "PDF files, videos under 5 minutes"}
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {isVietnamese ? "Hỏi tối đa " : "Ask up to "}
                      <span className="text-blue-500 font-medium">50</span>
                      {isVietnamese ? " lần (1 lần không quá " : " times (1 time not exceeding "}
                      <span className="text-blue-500 font-medium">500</span>
                      {isVietnamese ? " từ)" : " words)"}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {isVietnamese ? "Tạo " : "Create "}
                      <span className="text-blue-500 font-medium">{isVietnamese ? "mind map" : "mind maps"}</span>
                    </span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleSubscribe("free")}
                  disabled={currentPlan === "Free" || isLoading}
                >
                  {currentPlan === "Free" ? "Current Plan" : "Get Started"}
                </Button>
              </CardFooter>
            </Card>

            {/* Standard Plan */}
            <Card className="border-4 border-blue-500 relative hover:shadow-xl transition-all">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Popular
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">Standard</CardTitle>
                <CardDescription className="text-lg">
                  {isVietnamese ? "Gói chức năng cơ bản" : "Basic features package"}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-5xl font-bold mb-6">
                  $5<span className="text-2xl font-normal">/month</span>
                </div>
                <ul className="space-y-3 text-left">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{isVietnamese ? "Upload không giới hạn file" : "Unlimited file uploads"}</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {isVietnamese ? "Tạo tối đa 20 " : "Create up to 20 "}
                      <span className="text-blue-500 font-medium">{isVietnamese ? "quizzes" : "quizzes"}</span>
                      {isVietnamese ? " và " : " and "}
                      <span className="text-blue-500 font-medium">{isVietnamese ? "flashcards" : "flashcards"}</span>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{isVietnamese ? "Tất cả tính năng của gói Free" : "All features from Free plan"}</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={() => handleSubscribe("standard")}
                  disabled={currentPlan === "Standard" || isLoading}
                >
                  {currentPlan === "Standard" ? "Current Plan" : "Subscribe Now"}
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-gray-200 hover:border-gray-300 transition-all">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">Pro</CardTitle>
                <CardDescription className="text-lg">
                  {isVietnamese ? "Gói chức năng cao cấp" : "Advanced features package"}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-5xl font-bold mb-6">
                  $10<span className="text-2xl font-normal">/month</span>
                </div>
                <ul className="space-y-3 text-left">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {isVietnamese ? "Không giới hạn các dịch vụ" : "Unlimited services"}
                      <span className="text-sm text-gray-500 block ml-7">
                        (Upload <span className="text-blue-500 font-medium">pdf, youtube, video, doc</span>)
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {isVietnamese ? "Tạo " : "Create "}
                      <span className="text-blue-500 font-medium">{isVietnamese ? "quizzes" : "quizzes"}</span>
                      {isVietnamese ? " và " : " and "}
                      <span className="text-blue-500 font-medium">{isVietnamese ? "flashcards" : "flashcards"}</span>
                      {isVietnamese ? " không giới hạn" : " without limits"}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {isVietnamese ? "Tất cả tính năng của gói Standard" : "All features from Standard plan"}
                    </span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleSubscribe("pro")}
                  disabled={currentPlan === "Pro" || isLoading}
                >
                  {currentPlan === "Pro" ? "Current Plan" : "Go Pro"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Need a custom plan for your team?</h2>
            <p className="text-lg text-gray-600 mb-6">
              Contact us for enterprise pricing and custom solutions for your organization.
            </p>
            <Link href="#contact">
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer onNavClick={handleNavClick} />

      {/* Auth Modal Overlay */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuth(false)}></div>
          <div className="z-10 w-full max-w-md">
            <AuthUI />
            <button
              onClick={() => setShowAuth(false)}
              className="mt-4 text-white hover:underline text-sm mx-auto block"
            >
              Return to page
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

