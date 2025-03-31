"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Key, AlertCircle, CheckCircle } from "lucide-react"
import { authAPI } from "@/lib/api"

export function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [userId, setUserId] = useState<string | null>(null)

  // Get user ID from localStorage when component mounts
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id")
    setUserId(storedUserId)
  }, [])

  // Password strength indicators
  const hasMinLength = newPassword.length >= 8
  const hasUppercase = /[A-Z]/.test(newPassword)
  const hasLowercase = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword)

  const passwordStrength = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length

  const getStrengthLabel = () => {
    if (passwordStrength <= 2) return "Weak"
    if (passwordStrength <= 4) return "Medium"
    return "Strong"
  }

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500"
    if (passwordStrength <= 4) return "bg-yellow-500"
    return "bg-green-500"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: "", text: "" })

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" })
      setIsLoading(false)
      return
    }

    if (passwordStrength < 3) {
      setMessage({ type: "error", text: "Password is too weak. Please choose a stronger password." })
      setIsLoading(false)
      return
    }

    if (!userId) {
      setMessage({ type: "error", text: "User ID not found. Please log in again." })
      setIsLoading(false)
      return
    }

    try {
      console.log("Attempting to change password for user:", userId)

      // Call the API to change password
      const response = await authAPI.changePassword(userId, currentPassword, newPassword)

      // Check if the response indicates success
      if (response && response.success) {
        // Handle successful response
        setMessage({ type: "success", text: "Password changed successfully" })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        // Handle unsuccessful response
        const errorMsg = response?.message || "Failed to change password. Please try again."
        setMessage({ type: "error", text: errorMsg })
      }
    } catch (error: any) {
      console.error("Password change error:", error)

      // Handle error response
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to change password. Please try again."
      setMessage({ type: "error", text: errorMessage })
    } finally {
      setIsLoading(false)
    }
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
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="flex">
                  <Key className="w-5 h-5 text-gray-400 mr-2 self-center" />
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="flex-1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="flex">
                  <Key className="w-5 h-5 text-gray-400 mr-2 self-center" />
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1"
                    required
                  />
                </div>

                {newPassword && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Password strength: {getStrengthLabel()}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>

                    <ul className="mt-3 space-y-1 text-sm">
                      <li className={`flex items-center gap-1 ${hasMinLength ? "text-green-600" : "text-gray-500"}`}>
                        {hasMinLength ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        At least 8 characters
                      </li>
                      <li className={`flex items-center gap-1 ${hasUppercase ? "text-green-600" : "text-gray-500"}`}>
                        {hasUppercase ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        At least one uppercase letter
                      </li>
                      <li className={`flex items-center gap-1 ${hasLowercase ? "text-green-600" : "text-gray-500"}`}>
                        {hasLowercase ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        At least one lowercase letter
                      </li>
                      <li className={`flex items-center gap-1 ${hasNumber ? "text-green-600" : "text-gray-500"}`}>
                        {hasNumber ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        At least one number
                      </li>
                      <li className={`flex items-center gap-1 ${hasSpecialChar ? "text-green-600" : "text-gray-500"}`}>
                        {hasSpecialChar ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        At least one special character
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="flex">
                  <Key className="w-5 h-5 text-gray-400 mr-2 self-center" />
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex-1"
                    required
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Passwords do not match
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading || !currentPassword || !newPassword || !confirmPassword || !userId}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

