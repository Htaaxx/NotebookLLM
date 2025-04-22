"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import {accountTypeAPI} from "@/lib/api"

interface PaymentCard {
  id: string
  cardNumber: string
  cardHolder: string
  expiryDate: string
  isDefault: boolean
}

export function PaymentMethod() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [showAddCard, setShowAddCard] = useState(false)
  const [currentPlan, setCurrentPlan] = useState("Free")
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userID, setUserID] = useState<string | null>(null)

  // Sample saved cards
  const [savedCards, setSavedCards] = useState<PaymentCard[]>([
    {
      id: "card1",
      cardNumber: "**** **** **** 4242",
      cardHolder: "John Doe",
      expiryDate: "12/25",
      isDefault: true,
    },
  ])

  // New card form
  const [newCard, setNewCard] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  })

  useEffect(() => {
    const fetchAccountType = async () => {
      // Load user data
      const storedUsername = localStorage.getItem("username")
      const storedUserID = localStorage.getItem("user_id")

      if (storedUserID) {
        setUserID(storedUserID)
      }

      if (storedUsername) {
        setUserName(storedUsername)
      }

      if (storedUserID) {
        try {
          const storedPlan = await accountTypeAPI.getAccountTypes(storedUserID);
          setCurrentPlan(storedPlan.accountType);
        } catch (error) {
          console.error("Error fetching account types:", error);
        }
      } else {
        console.error("User ID is null, cannot fetch account types.");
      }      
    }

    fetchAccountType()
  }, [])

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Format card number with spaces
    if (name === "cardNumber") {
      const formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19)

      setNewCard((prev) => ({ ...prev, [name]: formattedValue }))
      return
    }

    // Format expiry date
    if (name === "expiryDate") {
      const formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .slice(0, 5)

      setNewCard((prev) => ({ ...prev, [name]: formattedValue }))
      return
    }

    setNewCard((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const newCardObj: PaymentCard = {
        id: `card${Date.now()}`,
        cardNumber: `**** **** **** ${newCard.cardNumber.slice(-4)}`,
        cardHolder: newCard.cardHolder,
        expiryDate: newCard.expiryDate,
        isDefault: savedCards.length === 0,
      }

      setSavedCards((prev) => [...prev, newCardObj])
      setNewCard({
        cardNumber: "",
        cardHolder: "",
        expiryDate: "",
        cvv: "",
      })
      setShowAddCard(false)
      setMessage({ type: "success", text: "Payment method added successfully" })
      setIsLoading(false)

      // In a real app, you would save this card to Stripe and your backend
    }, 1000)
  }

  const handleSetDefault = (cardId: string) => {
    setSavedCards((prev) =>
      prev.map((card) => ({
        ...card,
        isDefault: card.id === cardId,
      })),
    )
  }

  const handleDeleteCard = (cardId: string) => {
    setSavedCards((prev) => {
      const filtered = prev.filter((card) => card.id !== cardId)

      // If we deleted the default card and there are other cards, make the first one default
      if (prev.find((card) => card.id === cardId)?.isDefault && filtered.length > 0) {
        filtered[0].isDefault = true
      }

      return filtered
    })
  }

  const handleUpgradePlan = () => {
    // Store the default card in localStorage for the payment page to use
    const defaultCard = savedCards.find((card) => card.isDefault)
    if (defaultCard) {
      localStorage.setItem("defaultPaymentCard", JSON.stringify(defaultCard))
    }

    // Navigate to pricing page
    router.push("/pricing")
  }

  return (
    <div className="space-y-6">
      {message.text && (
        <div
          className={`p-4 rounded-md flex items-start gap-3 ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 mt-0.5" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment methods for subscription and purchases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Saved Cards */}
            {savedCards.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Saved Payment Methods</h3>
                <div className="space-y-3">
                  {savedCards.map((card) => (
                    <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-10 h-10 text-gray-400" />
                        <div>
                          <div className="font-medium">{card.cardNumber}</div>
                          <div className="text-sm text-gray-500">
                            {card.cardHolder} • Expires {card.expiryDate}
                          </div>
                        </div>
                        {card.isDefault && (
                          <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!card.isDefault && (
                          <Button variant="outline" size="sm" onClick={() => handleSetDefault(card.id)}>
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Card */}
            {!showAddCard ? (
              <Button
                variant="outline"
                className="w-full py-6 border-dashed flex items-center justify-center gap-2"
                onClick={() => setShowAddCard(true)}
              >
                <Plus className="w-5 h-5" />
                Add Payment Method
              </Button>
            ) : (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Add New Card</h3>
                <form onSubmit={handleAddCard} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={newCard.cardNumber}
                        onChange={handleCardInputChange}
                        maxLength={19}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardHolder">Cardholder Name</Label>
                      <Input
                        id="cardHolder"
                        name="cardHolder"
                        placeholder="John Doe"
                        value={newCard.cardHolder}
                        onChange={handleCardInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={newCard.expiryDate}
                        onChange={handleCardInputChange}
                        maxLength={5}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        type="password"
                        placeholder="123"
                        value={newCard.cvv}
                        onChange={handleCardInputChange}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setShowAddCard(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                      {isLoading ? "Adding..." : "Add Card"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Subscription Info */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Current Subscription</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{currentPlan} Plan</p>
                  <p className="text-sm text-gray-500">
                    {currentPlan === "FREE"
                      ? "Upgrade to access premium features"
                      : currentPlan === "STANDARD"
                        ? "Upgrade to Pro for all features"
                        : "You're on our highest tier plan"}
                  </p>
                </div>
                {currentPlan !== "Pro" && (
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleUpgradePlan}>
                    Upgrade Plan
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

