"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent } from "@/components/ui/card"
import { ChangePassword } from "@/components/profile/change-password"
import { PaymentMethod } from "@/components/profile/payment-method"
import { Key, CreditCard } from "lucide-react"

type ProfileSection = "password" | "payment"

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<ProfileSection>("password")
  const [userName, setUserName] = useState("User")

  useEffect(() => {
    // Load user data from localStorage or API
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUserName(storedUsername)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <NavBar />
      <main className="container mx-auto p-6 flex-grow">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

          <div className="grid md:grid-cols-[250px_1fr] gap-8">
            {/* Sidebar */}
            <div className="space-y-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-16 h-16 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold">{userName}</h2>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => setActiveSection("password")}
                      className={`flex items-center w-full p-3 rounded-lg text-left hover:bg-gray-50 transition-colors ${
                        activeSection === "password" ? "text-green-600 border-b-2 border-green-600" : ""
                      }`}
                    >
                      <Key className="w-5 h-5 mr-3" />
                      <span className="font-medium">Change Password</span>
                    </button>

                    <button
                      onClick={() => setActiveSection("payment")}
                      className={`flex items-center w-full p-3 rounded-lg text-left hover:bg-gray-50 transition-colors ${
                        activeSection === "payment" ? "text-green-600 border-b-2 border-green-600" : ""
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mr-3" />
                      <span className="font-medium">Payment Method</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <div>
              {activeSection === "password" && <ChangePassword />}
              {activeSection === "payment" && <PaymentMethod />}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

