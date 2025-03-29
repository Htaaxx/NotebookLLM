"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent } from "@/components/ui/card"
import { UserProfile } from "@/components/profile/user-profile"
import { ChangePassword } from "@/components/profile/change-password"
import { PaymentMethod } from "@/components/profile/payment-method"
import { UserCircle, Key, CreditCard } from "lucide-react"

type ProfileSection = "profile" | "password" | "payment"

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<ProfileSection>("profile")
  const [userName, setUserName] = useState("User")
  const [email, setEmail] = useState("user@example.com")

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
                      <UserCircle className="w-16 h-16 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold">{userName}</h2>
                    <p className="text-gray-500 text-sm">{email}</p>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => setActiveSection("profile")}
                      className={`flex items-center w-full p-3 rounded-lg text-left hover:bg-gray-50 transition-colors ${
                        activeSection === "profile" ? "text-green-600 border-b-2 border-green-600" : ""
                      }`}
                    >
                      <UserCircle className="w-5 h-5 mr-3" />
                      <span className="font-medium">User Profile</span>
                    </button>

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
              {activeSection === "profile" && <UserProfile userName={userName} email={email} />}
              {activeSection === "password" && <ChangePassword />}
              {activeSection === "payment" && <PaymentMethod />}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

