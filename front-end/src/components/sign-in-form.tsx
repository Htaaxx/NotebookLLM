"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Check, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"
import { useLanguage } from "@/lib/language-context"

interface SignInFormProps {
  onSuccess?: () => void
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { language } = useLanguage()
  const isVietnamese = language === "vi"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await authAPI.signIn(username, password)
      setIsSuccess(true)

      // Wait a moment to show success state
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/defaultPage")
        }
      }, 1000)
    } catch (err: any) {
      console.error("Sign in error:", err)

      if (err.response?.status === 401) {
        setError(isVietnamese ? "Tên đăng nhập hoặc mật khẩu không đúng" : "Invalid username or password")
      } else {
        setError(
          isVietnamese
            ? "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau."
            : "An error occurred during sign in. Please try again later.",
        )
      }

      setIsLoading(false)
    }
  }

  // For development/testing only - to be removed in production
  const handleDemoLogin = async () => {
    setIsLoading(true)

    // Simulate a successful login for development purposes
    setTimeout(() => {
      // Store demo user data in localStorage
      localStorage.setItem("accessToken", "demo-token")
      localStorage.setItem("refreshToken", "demo-refresh-token")
      localStorage.setItem("username", "DemoUser")
      localStorage.setItem("user_id", "demo-user-id")

      setIsSuccess(true)

      // Wait a moment to show success state
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/defaultPage")
        }
      }, 1000)
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="username" className="text-black text-xs">
            {isVietnamese ? "Tên đăng nhập" : "Username"}
          </Label>
          <Input
            id="username"
            placeholder={isVietnamese ? "Nhập tên đăng nhập" : "Enter username"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="bg-white text-black border-gray-300 h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-black text-xs">
              {isVietnamese ? "Mật khẩu" : "Password"}
            </Label>
            <button type="button" className="text-xs text-blue-500 hover:underline">
              {isVietnamese ? "Quên mật khẩu?" : "Forgot password?"}
            </button>
          </div>
          <Input
            id="password"
            type="password"
            placeholder={isVietnamese ? "Nhập mật khẩu" : "Enter password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white text-black border-gray-300 h-8 text-sm"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white h-8 text-sm"
        disabled={isLoading || isSuccess}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
        ) : isSuccess ? (
          <Check className="mr-2 h-3 w-3" />
        ) : null}
        {isLoading
          ? isVietnamese
            ? "Đang đăng nhập..."
            : "Signing in..."
          : isSuccess
            ? isVietnamese
              ? "Đăng nhập thành công!"
              : "Sign in successful!"
            : isVietnamese
              ? "Đăng nhập"
              : "Sign in"}
      </Button>

      {/* Development/demo mode button - to be removed in production */}
      <Button
        type="button"
        variant="outline"
        className="w-full border-green-600 text-green-600 hover:bg-green-50 h-8 text-sm"
        onClick={handleDemoLogin}
        disabled={isLoading || isSuccess}
      >
        {isVietnamese ? "Đăng nhập dùng thử" : "Demo Login"}
      </Button>
    </form>
  )
}

