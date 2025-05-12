"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-festive-cream flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200">
        <CardContent className="pt-6 pb-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong!</h2>
          <p className="text-gray-600 mb-6">{error.message || "An error occurred while loading this page."}</p>
          <div className="space-x-4">
            <Button
              onClick={() => reset()}
              className="bg-gradient-to-r from-festive-purple to-festive-pink hover:opacity-90 text-white"
            >
              Try again
            </Button>
            <Button onClick={() => (window.location.href = "/")} variant="outline" className="border-gray-200">
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
