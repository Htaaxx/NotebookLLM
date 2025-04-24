"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Check, Loader2, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"
import { useLanguage } from "@/lib/language-context"

interface SignInFormProps {
  onSuccess?: () => void
  onSwitchToSignUp?: () => void
  onOAuthSignIn?: (provider: string) => void
  isOAuthLoading?: boolean
}

export function SignInForm({ onSuccess, onSwitchToSignUp, onOAuthSignIn, isOAuthLoading }: SignInFormProps) {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { language } = useLanguage()
  const isVietnamese = language === "vi"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await authAPI.signIn(username, password)
      console.log("Sign in successful:", response)
      setIsSuccess(true)

      // Wait a moment to show success state
      setTimeout(() => {
        console.log("Redirecting after successful sign in")
        if (onSuccess) {
          console.log("Calling onSuccess callback")
          onSuccess()
        } else {
          console.log("No onSuccess callback, redirecting directly")
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="text-center p-6 pb-2">
        <h1 className="text-4xl font-bold text-white tracking-wide">SIGN IN</h1>
        <p className="text-white mt-1">to your account to continue</p>
      </div>

      {/* Form Container */}
      <div className="bg-[#F2F5DA] m-4 p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="space-y-1">
            <Label htmlFor="username" className="text-[#518650] font-medium">
              Username
            </Label>
            <Input
              id="username"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-[#F2F5DA] border-[#86AB5D] text-[#518650] h-12 rounded-full"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[#518650] font-medium">
                Password
              </Label>
              <button type="button" className="text-xs text-[#518650] hover:underline">
                {isVietnamese ? "Quên mật khẩu?" : "Forgot password?"}
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#F2F5DA] border-[#86AB5D] text-[#518650] h-12 rounded-full pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#518650]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remember"
              className="rounded border-[#86AB5D] text-[#86AB5D] focus:ring-[#86AB5D]"
            />
            <Label htmlFor="remember" className="text-sm text-[#518650]">
              {isVietnamese ? "Ghi nhớ đăng nhập" : "Remember me"}
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#E48D44] hover:bg-[#d47d34] text-white h-12 rounded-full"
            disabled={isLoading || isSuccess}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isSuccess ? (
              <Check className="mr-2 h-4 w-4" />
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

          <div className="text-center text-[#518650] text-sm">Or continue with</div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              className="bg-[#86AB5D] hover:bg-[#76954F] text-white border-none h-12 rounded-full"
              onClick={() => onOAuthSignIn && onOAuthSignIn("google")}
              disabled={isOAuthLoading}
            >
              {isOAuthLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign in with
                  <br />
                  Google
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="bg-[#86AB5D] hover:bg-[#76954F] text-white border-none h-12 rounded-full"
              onClick={() => onOAuthSignIn && onOAuthSignIn("github")}
              disabled={isOAuthLoading}
            >
              {isOAuthLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign in with
                  <br />
                  Github
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-[#518650] text-sm pt-2">
            {isVietnamese ? "Chưa có tài khoản? " : "Don't have an account? "}
            <button type="button" onClick={onSwitchToSignUp} className="text-[#E48D44] hover:underline font-medium">
              {isVietnamese ? "Đăng ký ngay" : "Sign up now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
