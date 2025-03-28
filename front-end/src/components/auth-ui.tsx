"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn} from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SignInForm } from "@/components/sign-in-form"
import { SignUpForm } from "@/components/sign-up-form"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export default function AuthUI() {
  const [activeTab, setActiveTab] = useState<string>("signin")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useLanguage()

  // Redirect if already authenticated

  // Handle successful authentication
  const handleAuthSuccess = () => {
    router.push("/defaultPage")
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

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {/* Logo and App Name */}
      <div className="flex flex-col items-center mb-6">
        <div className="p-3 bg-white rounded-full shadow-md mb-2">
          <Logo className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-center text-white">NoteUS</h1>
        <p className="text-gray-300 text-center max-w-xs">Your AI-powered note-taking assistant</p>
      </div>

      <Card className="w-full border-0 shadow-xl bg-white text-black">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-black">Welcome back</CardTitle>
          <CardDescription className="text-center text-gray-600">
            {activeTab === "signin" ? "Sign in to your account to continue" : "Create an account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}

          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-6">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center rounded-lg border bg-white px-5 py-2.5 text-center text-sm font-medium text-black hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-[#24292F]/50 disabled:opacity-50"
                onClick={() => handleOAuthSignIn("google")}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Continue with Google
              </button>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center rounded-lg border bg-white px-5 py-2.5 text-center text-sm font-medium text-black hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-[#24292F]/50 disabled:opacity-50"
                onClick={() => handleOAuthSignIn("github")}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                Continue with GitHub
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-600">OR SIGN IN WITH OUR ACCOUNT</span>
              </div>
            </div>
            <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab} className="text-black">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="signin" className="text-black data-[state=active]:bg-white">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-black data-[state=active]:bg-white">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <SignInForm onSuccess={handleAuthSuccess} />
              </TabsContent>
              <TabsContent value="signup">
                <SignUpForm onSuccess={handleAuthSuccess} />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

