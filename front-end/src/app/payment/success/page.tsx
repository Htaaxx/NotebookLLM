"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [planName, setPlanName] = useState<string>("your plan")

  useEffect(() => {
    // Get current plan from localStorage
    const currentPlan = localStorage.getItem("currentPlan")
    if (currentPlan) {
      setPlanName(currentPlan)
    }

    // In a real app, you would verify the payment with your backend using the session_id
    const sessionId = searchParams.get("session_id")

    if (sessionId) {
      console.log("Payment session ID:", sessionId)
      // In a real app, you would verify the payment status with your backend
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>Thank you for subscribing to the {planName} plan</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">Your subscription is now active. You can now enjoy all the features of your plan.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => router.push("/defaultPage")}>
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

