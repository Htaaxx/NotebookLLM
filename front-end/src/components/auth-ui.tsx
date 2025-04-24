"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { SignInForm } from "@/components/sign-in-form"
import { SignUpForm } from "@/components/sign-up-form"
import { useLanguage } from "@/lib/language-context"

interface AuthUIProps {
  initialMode?: "signin" | "signup"
  onAuthSuccess?: () => void
}

export default function AuthUI({ initialMode = "signin", onAuthSuccess }: AuthUIProps) {
  const [activeTab, setActiveTab] = useState(initialMode)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { t, language } = useLanguage()
  const isVietnamese = language === "vi"

  // Update active tab when initialMode prop changes
  useEffect(() => {
    setActiveTab(initialMode)
  }, [initialMode])

  // Handle successful authentication
  const handleAuthSuccess = () => {
    if (onAuthSuccess) {
      onAuthSuccess()
    } else {
      router.push("/defaultPage")
    }
  }

  // Handle OAuth sign in
  const handleOAuthSignIn = async (provider: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: "/defaultPage",
      })

      if (result?.error) {
        console.error("OAuth sign in error:", result.error)
        setError(`Authentication failed: ${result.error}`)
      } else if (result?.url) {
        // Successful sign-in with redirect URL
        router.push(result.url)
      }
    } catch (error) {
      console.error("OAuth sign in error:", error)
      setError("Authentication failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-3xl overflow-hidden bg-[#E48D44] shadow-xl">
        {activeTab === "signin" ? (
          <SignInForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignUp={() => setActiveTab("signup")}
            onOAuthSignIn={handleOAuthSignIn}
            isOAuthLoading={isLoading}
          />
        ) : (
          <SignUpForm
            onSuccess={() => {
              setActiveTab("signin")
              handleAuthSuccess()
            }}
            onSwitchToSignIn={() => setActiveTab("signin")}
            onOAuthSignIn={handleOAuthSignIn}
            isOAuthLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}
