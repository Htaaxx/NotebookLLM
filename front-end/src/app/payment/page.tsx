"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Check, ArrowLeft, Loader2 } from "lucide-react"
import { plans, createPaymentIntent, getStripe } from "@/lib/stripe"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

// Payment form component
function CheckoutForm({
  clientSecret,
  planName,
  amount,
  onSuccess,
}: {
  clientSecret: string
  planName: string
  amount: number
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [savedCard, setSavedCard] = useState<any>(null)
  const [useStoredCard, setUseStoredCard] = useState(false)

  useEffect(() => {
    // Get saved card from localStorage
    const storedCard = localStorage.getItem("defaultPaymentCard")
    if (storedCard) {
      setSavedCard(JSON.parse(storedCard))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setErrorMessage("Stripe has not been properly initialized")
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      // Make sure elements are properly mounted before calling confirmPayment
      const element = elements.getElement(PaymentElement)
      if (!element) {
        throw new Error("Payment Element not mounted")
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: "if_required",
      })

      if (error) {
        setErrorMessage(error.message || "An error occurred with your payment")
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment successful
        onSuccess()
      }
    } catch (error: any) {
      console.error("Payment error:", error)
      setErrorMessage(error.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {savedCard && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="use-saved-card"
              checked={useStoredCard}
              onCheckedChange={(checked) => setUseStoredCard(checked === true)}
            />
            <Label htmlFor="use-saved-card" className="cursor-pointer">
              Use saved card ({savedCard.cardNumber})
            </Label>
          </div>
        </div>
      )}

      {!useStoredCard && <PaymentElement />}

      {errorMessage && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{errorMessage}</div>}

      <div className="border-t pt-4">
        <div className="flex justify-between mb-2">
          <span>Plan</span>
          <span className="font-medium">{planName}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span>Total</span>
          <span className="font-medium">${amount.toFixed(2)}/month</span>
        </div>
      </div>

      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={!stripe || isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>Pay ${amount.toFixed(2)}</>
        )}
      </Button>
    </form>
  )
}

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stripePromise, setStripePromise] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("accessToken")
    if (!token) {
      router.push("/pricing")
      return
    }
    setIsAuthenticated(true)

    // Load Stripe
    getStripe().then(setStripePromise)

    // Get plan from URL params
    const planId = searchParams.get("plan")

    // If no plan specified, try to get from localStorage
    if (!planId) {
      const storedPlan = localStorage.getItem("selectedPlan")
      if (storedPlan) {
        setSelectedPlan(JSON.parse(storedPlan))
      } else {
        router.push("/pricing")
        return
      }
    } else {
      const plan = plans.find((p) => p.id === planId)
      if (plan) {
        setSelectedPlan(plan)
        localStorage.setItem("selectedPlan", JSON.stringify(plan))
      } else {
        router.push("/pricing")
        return
      }
    }
  }, [router, searchParams])

  useEffect(() => {
    // Create payment intent when plan is selected
    if (selectedPlan && selectedPlan.price > 0 && isAuthenticated) {
      createPaymentIntent(selectedPlan.price)
        .then((secret) => {
          setClientSecret(secret)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error creating payment intent:", error)
          setIsLoading(false)
        })
    } else if (selectedPlan && selectedPlan.price === 0) {
      // Free plan doesn't need payment
      setIsLoading(false)
    }
  }, [selectedPlan, isAuthenticated])

  const handlePaymentSuccess = () => {
    // In a real app, you would update the user's subscription in your backend
    localStorage.setItem("currentPlan", selectedPlan.name)
    router.push("/payment/success")
  }

  const handleFreePlanActivation = () => {
    // Activate free plan
    localStorage.setItem("currentPlan", "Free")
    router.push("/payment/success")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavBar />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-green-600 mb-4" />
            <p className="text-lg">Loading payment information...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Button variant="ghost" className="mb-6 flex items-center" onClick={() => router.push("/pricing")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
              <CardDescription>
                {selectedPlan?.price > 0
                  ? `You're subscribing to the ${selectedPlan?.name} plan for $${selectedPlan?.price}/month`
                  : `You're activating the ${selectedPlan?.name} plan`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedPlan?.price > 0 && clientSecret && stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm
                    clientSecret={clientSecret}
                    planName={selectedPlan.name}
                    amount={selectedPlan.price}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : selectedPlan?.price === 0 ? (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 text-green-700 rounded-md flex items-start">
                    <Check className="h-5 w-5 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Free Plan</p>
                      <p>You're activating the Free plan which doesn't require payment.</p>
                    </div>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleFreePlanActivation}>
                    Activate Free Plan
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-red-500">Unable to load payment information. Please try again.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

