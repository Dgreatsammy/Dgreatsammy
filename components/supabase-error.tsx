"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function SupabaseError() {
  return (
    <div className="min-h-screen bg-festive-cream flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200">
        <CardContent className="pt-6 pb-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Configuration Error</h2>
          <p className="text-gray-600 mb-6">
            Supabase URL and/or Anon Key are missing. Please make sure your environment variables are properly set up.
          </p>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md text-left">
              <p className="text-sm font-mono mb-2">Required environment variables:</p>
              <ul className="list-disc pl-5 text-sm font-mono text-gray-600">
                <li>NEXT_PUBLIC_SUPABASE_URL</li>
                <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              </ul>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-festive-purple to-festive-pink hover:opacity-90 text-white"
            >
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
