"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Check if we have a hash in the URL (from email link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    if (!hashParams.get("access_token")) {
      setError("Invalid or expired reset link. Please request a new password reset.")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setError(error.message)
      } else {
        setMessage("Password updated successfully. You can now log in with your new password.")
        setTimeout(() => {
          router.push("/login")
        }, 3000)
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
            {error ? (
              <div className="text-center py-4">
                <p className="text-red-500 mb-4">{error}</p>
                <Button
                  onClick={() => router.push("/forgot-password")}
                  className="bg-gradient-to-r from-festive-purple to-festive-pink hover:opacity-90 text-white"
                >
                  Request New Reset Link
                </Button>
              </div>
            ) : message ? (
              <div className="text-center py-4">
                <p className="text-green-600 mb-4">{message}</p>
                <Button
                  onClick={() => router.push("/login")}
                  className="bg-gradient-to-r from-festive-purple to-festive-pink hover:opacity-90 text-white"
                >
                  Go to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="border-gray-200 focus-visible:ring-festive-purple"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="border-gray-200 focus-visible:ring-festive-purple"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-festive-purple to-festive-pink hover:opacity-90 text-white"
                >
                  {isLoading ? "Updating Password..." : "Reset Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
