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
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      await authAPI.signUp(values.username, values.email, values.password)

      // After successful signup, sign in the user automatically
      await authAPI.signIn(values.username, values.password)

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {error && <div className="p-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">{error}</div>}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-black text-xs">Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter username"
                  className="bg-white text-black border-gray-300 h-8 text-sm"
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
              <FormLabel className="text-black text-xs">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter email"
                  className="bg-white text-black border-gray-300 h-8 text-sm"
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
              <FormLabel className="text-black text-xs">Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter password"
                  className="bg-white text-black border-gray-300 h-8 text-sm"
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
            <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-md p-2 border bg-white">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-3 w-3 mt-0.5" />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-black text-xs">
                  I agree to the{" "}
                  <a href="#" className="text-green-600 hover:text-green-700 underline-offset-4 hover:underline">
                    terms of service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-green-600 hover:text-green-700 underline-offset-4 hover:underline">
                    privacy policy
                  </a>
                </FormLabel>
                <FormMessage className="text-xs" />
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-8 text-sm" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </Form>
  )
}

