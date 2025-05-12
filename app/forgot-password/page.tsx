"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await resetPassword(email)
      if (error) {
        setError(error.message)
      } else {
        setIsSuccess(true)
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-festive-cream flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-festive-pink" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-festive-purple to-festive-pink bg-clip-text text-transparent">
              BIRTHDAY BLISS BUDDIES
            </h1>
            <Sparkles className="h-6 w-6 text-festive-purple" />
          </div>
          <p className="text-gray-600">Reset your password</p>
        </div>

        <Card className="border-festive-purple/20">
          <CardContent className="pt-6">
            {isSuccess ? (
              <div className="text-center py-4">
                <Sparkles className="h-12 w-12 text-festive-pink mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Check your email</h2>
                <p className="text-gray-600 mb-6">
                  We've sent you a password reset link. Please check your email to reset your password.
                </p>
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-festive-purple to-festive-pink hover:opacity-90 text-white">
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="border-gray-200 focus-visible:ring-festive-purple"
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-festive-purple to-festive-pink hover:opacity-90 text-white"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center mt-4">
                  <Link href="/login" className="text-sm text-festive-purple hover:text-festive-pink">
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
