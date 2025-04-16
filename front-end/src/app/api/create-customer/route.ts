import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia", // Updated to match the required type
  })
  
  try {
    const { email, name, paymentMethod } = await request.json()

    // Create a customer
    const customer = await stripe.customers.create({
      email,
      name,
      payment_method: paymentMethod,
      invoice_settings: {
        default_payment_method: paymentMethod,
      },
    })

    return NextResponse.json({ customerId: customer.id })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}

