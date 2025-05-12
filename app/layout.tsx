import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import { AuthProvider } from "@/contexts/auth-context"
import { SubscriptionProvider } from "@/contexts/subscription-context"
import SupabaseErrorWrapper from "@/components/supabase-error-wrapper"

const inter = Inter({ subsets: ["latin"] })

// Check if Supabase is properly configured
const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!isSupabaseConfigured) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <SupabaseErrorWrapper />
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SubscriptionProvider>
            <ToastProvider>
              {children}
              <ToastViewport />
            </ToastProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
