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
import { accountTypeAPI } from "@/lib/api"

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
  const [savedCard, setSavedCard] = useState<any>(null) // Assuming structure { cardNumber: string, paymentMethodId?: string }
  const [useStoredCard, setUseStoredCard] = useState(false)
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false) // State to track PaymentElement readiness

  useEffect(() => {
    // Get saved card from localStorage (consider more secure storage or backend fetching)
    const storedCard = localStorage.getItem("defaultPaymentCard")
    if (storedCard) {
      const parsedCard = JSON.parse(storedCard)
      setSavedCard(parsedCard)
    }

    setIsPaymentElementReady(false)

  }, [])

  useEffect(() => {
     if (!useStoredCard) {
        setIsPaymentElementReady(false);
     }
  }, [useStoredCard]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe) {
      setErrorMessage("Stripe has not been properly initialized")
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      let confirmResult;

      if (useStoredCard) {
        // --- Saved Card Payment Logic ---
        if (!savedCard?.paymentMethodId) {
           setErrorMessage("Saved card information is incomplete or missing Payment Method ID.")
           setIsLoading(false)
           return
        }
        console.log("Attempting confirmation with saved PaymentMethod:", savedCard.paymentMethodId);
        confirmResult = await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            payment_method: savedCard.paymentMethodId,
            return_url: `${window.location.origin}/payment/success`,
          },
          redirect: "if_required",
        });

      } else {
        if (!elements) {
          setErrorMessage("Stripe Elements context is not available")
          setIsLoading(false)
          return
        }
         if (!isPaymentElementReady) {
             setErrorMessage("Payment form is not ready yet. Please wait.");
             setIsLoading(false);
             return;
         }

        console.log("Attempting confirmation with Payment Element");
        confirmResult = await stripe.confirmPayment({
          elements, // Pass the elements instance containing the mounted PaymentElement
          confirmParams: {
            return_url: `${window.location.origin}/payment/success`,
          },
          redirect: "if_required",
        });
      }

      // --- Process Result ---
      const { error, paymentIntent } = confirmResult;

      if (error) {
         console.error("Stripe confirmation error:", error);
         // Provide more specific errors if available
        setErrorMessage(error.message || "An error occurred with your payment")
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("Payment succeeded:", paymentIntent);
        // If saving card was intended and successful, store the new PM
        // This often happens via webhooks server-side, but can be done client-side too
        // if (paymentIntent.payment_method && shouldSaveCard) {
        //    const newPaymentMethod = await stripe.retrievePaymentMethod(paymentIntent.payment_method);
        //    if (newPaymentMethod.paymentMethod) {
        //       const cardDetails = {
        //          cardNumber: `**** **** **** ${newPaymentMethod.paymentMethod.card.last4}`,
        //          paymentMethodId: newPaymentMethod.paymentMethod.id
        //       };
        //       localStorage.setItem("defaultPaymentCard", JSON.stringify(cardDetails));
        //    }
        // }
        onSuccess()
      } else if (paymentIntent) {
         // Handle other statuses like 'requires_action', 'processing' if needed
         console.warn("PaymentIntent status:", paymentIntent.status);
         setErrorMessage(`Payment status: ${paymentIntent.status}. Please follow any instructions or wait.`);
      }

    } catch (error: any) {
      console.error("Payment submission error:", error)
      setErrorMessage(error.message || "An unexpected error occurred during payment submission")
    } finally {
      setIsLoading(false)
    }
  }

  // Determine if the submit button should be disabled
  const isSubmitDisabled =
    !stripe || // Stripe.js not loaded
    isLoading || // Payment processing
    (useStoredCard && !savedCard?.paymentMethodId) || // Using saved card, but ID missing
    (!useStoredCard && !isPaymentElementReady); // Using Payment Element, but it's not ready

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Only show saved card option if a card with a PM ID exists */}
      {savedCard?.paymentMethodId && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="use-saved-card"
              checked={useStoredCard}
              onCheckedChange={(checked) => {
                 const isChecked = checked === true;
                 setUseStoredCard(isChecked);
                 setErrorMessage(null); // Clear errors on change
              }}
            />
            <Label htmlFor="use-saved-card" className="cursor-pointer">
              Use saved card ({savedCard.cardNumber}) {/* Display last 4 digits */}
            </Label>
          </div>
        </div>
      )}

      {/* Conditionally render PaymentElement */}
      {/* Add a key to force remount if needed, e.g., when options change */}
      {!useStoredCard && (
         <div className={isPaymentElementReady ? '' : 'opacity-50'}> {/* Optional: visual feedback */}
             <PaymentElement
                key={clientSecret} // Force remount if clientSecret changes
                onReady={() => {
                   console.log("PaymentElement Ready");
                   setIsPaymentElementReady(true);
                }}
                // onChange={(event) => { // Handle validation errors, etc.
                //   if (event.error) {
                //     setErrorMessage(event.error.message);
                //   } else {
                //     setErrorMessage(null);
                //   }
                // }}
             />
         </div>
      )}

      {errorMessage && <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md border border-red-200">{errorMessage}</div>}

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

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
        disabled={isSubmitDisabled} // Use the calculated disabled state
      >
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

// --- PaymentPage Component (Main Logic) ---
export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  // Load StripePromise directly, no need for state if loaded once
  const [stripePromise] = useState(() => getStripe()); // Initialize StripePromise immediately
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null); // State for errors during PI creation

  useEffect(() => {
    // Check if user is authenticated (client-side check)
    const token = localStorage.getItem("accessToken") // Replace with your actual auth check
    if (!token) {
      console.log("User not authenticated, redirecting to pricing.");
      router.push("/pricing")
      return
    }
    setIsAuthenticated(true)
    console.log("User authenticated.");

    // Get plan from URL params or localStorage
    const planId = searchParams.get("plan")
    let resolvedPlan = null;

    if (planId) {
       resolvedPlan = plans.find((p) => p.id === planId)
       if(resolvedPlan) {
          localStorage.setItem("selectedPlan", JSON.stringify(resolvedPlan)); // Store the selected plan object
          console.log("Plan found from URL:", resolvedPlan.name);
       }
    } else {
       const storedPlanJson = localStorage.getItem("selectedPlan")
       if (storedPlanJson) {
          resolvedPlan = JSON.parse(storedPlanJson);
          console.log("Plan found from localStorage:", resolvedPlan.name);
       }
    }

    if (resolvedPlan) {
      setSelectedPlan(resolvedPlan)
    } else {
      console.log("No plan selected, redirecting to pricing.");
      router.push("/pricing")
      return; // Stop execution if no plan
    }
  }, [router, searchParams]) // Dependency array ensures this runs on route change

  useEffect(() => {
    // Create payment intent only when plan is selected, plan requires payment, and user is authenticated
    if (selectedPlan && selectedPlan.price > 0 && isAuthenticated) {
      console.log("Creating Payment Intent for plan:", selectedPlan.name, "Price:", selectedPlan.price);
      setIsLoading(true); // Show loading indicator while creating PI
      setPaymentError(null); // Clear previous errors
      createPaymentIntent(selectedPlan.price)
        .then((secret) => {
          console.log("Payment Intent created successfully.");
          setClientSecret(secret)
          setIsLoading(false) // Hide loading only after PI is created
        })
        .catch((error) => {
          console.error("Error creating payment intent:", error)
          setPaymentError("Failed to initialize payment. Please try again later.");
          setIsLoading(false) // Hide loading even on error
        })
    } else if (selectedPlan && selectedPlan.price === 0) {
       console.log("Selected plan is free, skipping Payment Intent.");
      // Free plan doesn't need payment intent or loading state for PI
      setIsLoading(false)
    }
     // If !selectedPlan or !isAuthenticated, loading might remain true from initial state
     // or might be set false if price === 0. Ensure loading is eventually false.
     else if (!selectedPlan) {
         // This case should ideally be handled by the first useEffect redirecting
         console.log("Waiting for plan selection...");
     }

  }, [selectedPlan, isAuthenticated]) // Runs when plan or auth state changes

  const handlePaymentSuccess = () => {
    console.log("handlePaymentSuccess called");


    // IMPORTANT: Update user's subscription status securely on your BACKEND
    // based on successful payment confirmation (ideally via webhooks).

    const userID = localStorage.getItem("user_id")
    // Client-side update is for UI feedback only.
    localStorage.setItem("currentPlan", selectedPlan?.name || 'Unknown') // Update UI state
    if (selectedPlan.name === "Pro") {
      if (userID) {
        const update = accountTypeAPI.updateAccountType(userID, "PRO");
      } else {
      if (userID) {
        const update = accountTypeAPI.updateAccountType(userID, "STANDARD");
      } else {
        console.error("User ID is null. Cannot update account type.");
      }
      }
    }
    // Consider removing sensitive items after success:
    // localStorage.removeItem("selectedPlan");
    router.push("/payment/success") // Redirect to success page
  }

  const handleFreePlanActivation = () => {
    console.log("handleFreePlanActivation called");
    // IMPORTANT: Update user's subscription status securely on your BACKEND.
    localStorage.setItem("currentPlan", selectedPlan?.name || "FREE")
    // localStorage.removeItem("selectedPlan");
    router.push("/payment/success")
  }


  // --- Render Logic ---

  // Combined Loading State Check
  const showLoadingIndicator = isLoading || (selectedPlan?.price > 0 && !clientSecret && !paymentError);

  if (showLoadingIndicator) {
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

   // Error State During Payment Intent Creation
   if (paymentError) {
     return (
       <div className="min-h-screen flex flex-col bg-white">
         <NavBar />
         <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
           <div className="max-w-md mx-auto text-center p-6 border border-red-200 bg-red-50 rounded-md">
              <CardTitle className="text-red-600 mb-3">Payment Error</CardTitle>
              <p className="text-red-700 mb-4">{paymentError}</p>
              <Button variant="outline" onClick={() => router.push("/pricing")}>
                 Go Back to Plans
              </Button>
           </div>
         </main>
       </div>
     );
   }

   // Main Content Render
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Button variant="ghost" className="mb-6 flex items-center text-gray-600 hover:text-gray-800" onClick={() => router.push("/pricing")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Button>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
              <CardDescription>
                {selectedPlan?.price > 0 && clientSecret // Ensure clientSecret exists for paid plans here
                  ? `You're subscribing to the ${selectedPlan?.name} plan for $${selectedPlan?.price}/month`
                  : selectedPlan
                  ? `You're activating the ${selectedPlan?.name} plan`
                  : "Loading plan details..." // Fallback description
                 }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Paid Plan Checkout */}
              {selectedPlan?.price > 0 && clientSecret && stripePromise ? (
                 // Pass clientSecret via options for Elements provider
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
                  <CheckoutForm
                    clientSecret={clientSecret} // Pass for potential use within CheckoutForm if needed e.g saved card flow.
                    planName={selectedPlan.name}
                    amount={selectedPlan.price}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : /* Free Plan Activation */
              selectedPlan?.price === 0 ? (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 text-green-800 rounded-md border border-green-200 flex items-start">
                    <Check className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-green-600" />
                    <div>
                      <p className="font-medium">Free Plan</p>
                      <p className="text-sm">This plan doesn't require payment. Click below to activate it instantly.</p>
                    </div>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleFreePlanActivation}>
                    Activate Free Plan
                  </Button>
                </div>
              ) : /* Fallback/Error if no plan matches conditions */ (
                <div className="text-center py-4">
                  <p className="text-gray-500">Select a plan to proceed.</p>
                  {/* This state should ideally not be reached due to redirects */}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}