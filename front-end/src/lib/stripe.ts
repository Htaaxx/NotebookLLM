import { loadStripe } from "@stripe/stripe-js"

// Load the Stripe.js library with your publishable key
export const getStripe = async () => {
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  if (!stripePublishableKey) {
    throw new Error("Stripe publishable key is not defined")
  }

  const stripePromise = loadStripe(stripePublishableKey)
  return stripePromise
}

// Define plan types
export interface Plan {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  priceId: string // Stripe price ID
}

// Define available plans
export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "For beginners",
    price: 0,
    features: [
      "Upload PDF files, videos under 5 minutes",
      "Ask up to 50 times (1 time not exceeding 500 words)",
      "Create mind maps",
    ],
    priceId: "", // Free plan doesn't need a price ID
  },
  {
    id: "standard",
    name: "Standard",
    description: "Basic features package",
    price: 5,
    features: ["Unlimited file uploads", "Create up to 20 quizzes and flashcards", "All features from Free plan"],
    priceId: "price_standard", // Replace with your actual Stripe price ID
  },
  {
    id: "pro",
    name: "Pro",
    description: "Advanced features package",
    price: 10,
    features: [
      "Unlimited services (Upload pdf, youtube, video, doc)",
      "Create quizzes and flashcards without limits",
      "All features from Standard plan",
    ],
    priceId: "price_pro", // Replace with your actual Stripe price ID
  },
]

// Function to create a checkout session
export const createCheckoutSession = async (priceId: string, customerId?: string) => {
  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId,
        customerId,
      }),
    })

    const { sessionId } = await response.json()
    return sessionId
  } catch (error) {
    console.error("Error creating checkout session:", error)
    throw error
  }
}

// Function to create a payment intent
export const createPaymentIntent = async (amount: number, customerId?: string) => {
  try {
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        customerId,
      }),
    })

    const { clientSecret } = await response.json()
    return clientSecret
  } catch (error) {
    console.error("Error creating payment intent:", error)
    throw error
  }
}

