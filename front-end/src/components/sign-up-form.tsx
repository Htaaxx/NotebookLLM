"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"

import { authAPI } from "@/lib/api"
import { accountTypeAPI } from "@/lib/api"
import { useLanguage } from "@/lib/language-context"

const formSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
})

type SignUpFormProps = {
  onSuccess: () => void
  onSwitchToSignIn?: () => void
  onOAuthSignIn?: (provider: string) => void
  isOAuthLoading?: boolean
}

export function SignUpForm({ onSuccess, onSwitchToSignIn, onOAuthSignIn, isOAuthLoading }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { language } = useLanguage()
  const isVietnamese = language === "vi"

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      terms: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      // Gọi API đăng ký
      const signupResponse = await authAPI.signUp(values.username, values.email, values.password)
      const userId = signupResponse.user_id

      // Create count record for the user
      if (userId) {
        try {
          await accountTypeAPI.createCountWithId(userId)
          console.log("Count record created for new user")
        } catch (countError) {
          console.error("Error creating count record:", countError)
          // Continue anyway, as the user is already created
        }
      } else {
        console.error("No user_id received from sign-in response")
      }

      // Call the success callback
      onSuccess()
    } catch (error) {
      console.error("Sign up error:", error)
      setError("Failed to create account. The username or email may already be in use.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="text-center p-6 pb-2">
        <h1 className="text-4xl font-bold text-white tracking-wide">SIGN UP</h1>
        <p className="text-white mt-1">to your account to continue</p>
      </div>

      {/* Form Container */}
      <div className="bg-[#F2F5DA] m-4 p-6 rounded-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="p-2 text-xs text-red-500 bg-red-50 rounded-md text-center">{error}</div>}

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[#518650] font-medium">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Username"
                      className="bg-[#F2F5DA] border-[#86AB5D] text-[#518650] h-12 rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[#518650] font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Email"
                      className="bg-[#F2F5DA] border-[#86AB5D] text-[#518650] h-12 rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[#518650] font-medium">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter Password"
                      className="bg-[#F2F5DA] border-[#86AB5D] text-[#518650] h-12 rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-md p-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-[#86AB5D] data-[state=checked]:border-[#86AB5D]"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-[#518650] text-xs">
                      I agree to the{" "}
                      <a href="#" className="text-[#E48D44] hover:underline">
                        terms of service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-[#E48D44] hover:underline">
                        privacy policy
                      </a>
                    </FormLabel>
                    <FormMessage className="text-xs" />
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-[#E48D44] hover:bg-[#d47d34] text-white h-12 rounded-full mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign up"
              )}
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
              {isVietnamese ? "Đã có tài khoản? " : "Already have an account? "}
              <button type="button" onClick={onSwitchToSignIn} className="text-[#E48D44] hover:underline font-medium">
                {isVietnamese ? "Đăng nhập" : "Sign in"}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
