"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { NavBar } from "@/components/nav-bar"
import { NavBar as HomeNavBar } from "@/components/home/navbar"
import { Footer } from "@/components/home/footer"
import AuthUI from "@/components/auth-ui"
import { useLanguage } from "@/lib/language-context"
import { plans } from "@/lib/stripe"
import { motion } from "framer-motion"
import { fadeIn, staggerContainer, buttonAnimation, cardHoverEffect } from "@/lib/motion-utils"

// Replace the getPlanLevel function with this improved version that handles null/undefined values
const getPlanLevel = (planName: string | null): number => {
  if (!planName) return 1 // Default to Free level if no plan is provided

  switch (planName.toLowerCase()) {
    case "pro":
      return 3
    case "standard":
      return 2
    case "free":
    default:
      return 1
  }
}

export default function PricingPage() {
  const [showAuth, setShowAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [userName, setUserName] = useState("")
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const { language } = useLanguage()
  const isVietnamese = language === "vi"
  const router = useRouter()

  // Check authentication status
  useEffect(() => {
    // Simulate some loading time
    const loadingTimer = setTimeout(() => {
      const token = localStorage.getItem("accessToken")
      const storedUsername = localStorage.getItem("username")

      if (token && storedUsername) {
        setIsAuthenticated(true)
        setUserName(storedUsername)

        // Get current plan from localStorage
        const userPlan = localStorage.getItem("currentPlan")
        if (userPlan) {
          setCurrentPlan(userPlan)
        } else {
          setCurrentPlan("Free") // Default to Free if no plan is stored
        }
      }

      setIsLoading(false)
    }, 500) // 500ms delay to show loading state

    return () => clearTimeout(loadingTimer)
  }, [])

  const handleNavClick = () => {
    // Don't do anything special here, let regular navigation happen
  }

  // Update the handleSubscribe function to be more robust
  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      // Store the selected plan ID and show auth modal
      setSelectedPlanId(planId)
      setShowAuth(true)
      return
    }

    // Get the level of the current plan and the selected plan
    const currentPlanLevel = getPlanLevel(currentPlan)
    const selectedPlanName = planId === "free" ? "Free" : planId === "standard" ? "Standard" : "Pro"
    const selectedPlanLevel = getPlanLevel(selectedPlanName)

    // If trying to subscribe to current plan, show message
    if (selectedPlanName.toLowerCase() === currentPlan?.toLowerCase()) {
      alert("You are already subscribed to this plan.")
      return
    }

    // Prevent downgrading to a lower plan
    if (selectedPlanLevel < currentPlanLevel) {
      alert("You cannot downgrade to a lower plan. Please contact support if you need assistance.")
      return
    }

    // User is authenticated, proceed with subscription
    proceedWithSubscription(planId)
  }

  const handleAuthSuccess = () => {
    // Called after successful authentication
    setIsAuthenticated(true)
    setShowAuth(false)

    // If user selected a plan before auth, proceed with that subscription
    if (selectedPlanId) {
      proceedWithSubscription(selectedPlanId)
    }
  }

  const proceedWithSubscription = (planId: string) => {
    setIsLoading(true)

    try {
      const selectedPlan = plans.find((plan) => plan.id === planId)

      if (planId === "free") {
        // Free plan doesn't need payment
        localStorage.setItem("currentPlan", "Free")
        router.push("/defaultPage")
        return
      }

      if (!selectedPlan || !selectedPlan.priceId) {
        throw new Error("Invalid plan selected")
      }

      // Store selected plan in localStorage for the payment page
      localStorage.setItem("selectedPlan", JSON.stringify(selectedPlan))

      // Navigate to payment page
      router.push(`/payment?plan=${planId}`)
    } catch (error) {
      console.error("Error subscribing to plan:", error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
            <p className="mt-2 text-gray-700">Loading pricing information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      {isAuthenticated ? (
        <NavBar />
      ) : (
        <HomeNavBar onNavClick={handleNavClick} onSignUp={() => setShowAuth(true)} onSignIn={() => setShowAuth(true)} />
      )}
      <motion.div className="py-20 px-6" initial="hidden" animate="show" variants={staggerContainer(0.1, 0.1)}>
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeIn("up", 0.1)}>
            <motion.h1 className="text-4xl font-bold mb-4" variants={fadeIn("up", 0.2)}>
              Choose Your Plan
            </motion.h1>
            <motion.p className="text-xl text-gray-600 max-w-3xl mx-auto" variants={fadeIn("up", 0.3)}>
              Select the perfect plan for your needs and start transforming your notes today.
            </motion.p>
            {isAuthenticated && currentPlan && (
              <motion.p className="mt-4 text-lg text-green-600" variants={fadeIn("up", 0.4)}>
                You are currently on the <strong>{currentPlan}</strong> plan
              </motion.p>
            )}
          </motion.div>

          <motion.div className="grid md:grid-cols-3 gap-8" variants={staggerContainer(0.1, 0.5)}>
            {/* Free Plan */}
            <motion.div variants={fadeIn("up", 0.5)}>
              <motion.div initial="rest" whileHover="hover" variants={cardHoverEffect}>
                <Card className="border-2 border-gray-200 h-full">
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
                    <motion.div className="w-full" whileHover="hover" whileTap="tap" variants={buttonAnimation}>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleSubscribe("free")}
                        disabled={
                          isLoading ||
                          (isAuthenticated &&
                            (currentPlan?.toLowerCase() === "free" || getPlanLevel(currentPlan) > getPlanLevel("Free")))
                        }
                      >
                        {isAuthenticated && currentPlan?.toLowerCase() === "free"
                          ? "Current Plan"
                          : isAuthenticated && getPlanLevel(currentPlan) > getPlanLevel("Free")
                            ? "Downgrade Not Available"
                            : "Get Started"}
                      </Button>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>

            {/* Standard Plan */}
            <motion.div variants={fadeIn("up", 0.6)}>
              <motion.div initial="rest" whileHover="hover" variants={cardHoverEffect} className="relative">
                <motion.div
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  Popular
                </motion.div>
                <Card className="border-4 border-blue-500 h-full">
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
                          <span className="text-blue-500 font-medium">
                            {isVietnamese ? "flashcards" : "flashcards"}
                          </span>
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{isVietnamese ? "Tất cả tính năng của gói Free" : "All features from Free plan"}</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <motion.div className="w-full" whileHover="hover" whileTap="tap" variants={buttonAnimation}>
                      <Button
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        onClick={() => handleSubscribe("standard")}
                        disabled={
                          isLoading ||
                          (isAuthenticated &&
                            (currentPlan?.toLowerCase() === "standard" ||
                              getPlanLevel(currentPlan) > getPlanLevel("Standard")))
                        }
                      >
                        {isAuthenticated && currentPlan?.toLowerCase() === "standard"
                          ? "Current Plan"
                          : isAuthenticated && getPlanLevel(currentPlan) > getPlanLevel("Standard")
                            ? "Downgrade Not Available"
                            : "Subscribe Now"}
                      </Button>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>

            {/* Pro Plan */}
            <motion.div variants={fadeIn("up", 0.7)}>
              <motion.div initial="rest" whileHover="hover" variants={cardHoverEffect}>
                <Card className="border-2 border-gray-200 h-full">
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
                          <span className="text-blue-500 font-medium">
                            {isVietnamese ? "flashcards" : "flashcards"}
                          </span>
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
                    <motion.div className="w-full" whileHover="hover" whileTap="tap" variants={buttonAnimation}>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleSubscribe("pro")}
                        disabled={isLoading || (isAuthenticated && currentPlan?.toLowerCase() === "pro")}
                      >
                        {isAuthenticated && currentPlan?.toLowerCase() === "pro" ? "Current Plan" : "Go Pro"}
                      </Button>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div className="mt-16 text-center" variants={fadeIn("up", 0.8)}>
            <motion.h2 className="text-2xl font-bold mb-4" variants={fadeIn("up", 0.9)}>
              Need a custom plan for your team?
            </motion.h2>
            <motion.p className="text-lg text-gray-600 mb-6" variants={fadeIn("up", 1.0)}>
              Contact us for enterprise pricing and custom solutions for your organization.
            </motion.p>
            <motion.div whileHover="hover" whileTap="tap" variants={buttonAnimation}>
              <Link href="#contact">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  Contact Sales
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <Footer onNavClick={handleNavClick} />

      {/* Auth Modal Overlay */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAuth(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          ></motion.div>
          <motion.div
            className="z-10 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <AuthUI onAuthSuccess={handleAuthSuccess} />
            <motion.button
              onClick={() => setShowAuth(false)}
              className="mt-4 text-white hover:underline text-sm mx-auto block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Return to page
            </motion.button>
          </motion.div>
        </div>
      )}
    </main>
  )
}
