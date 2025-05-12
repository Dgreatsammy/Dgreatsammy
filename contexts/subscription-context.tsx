"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

export type SubscriptionTier = "free" | "basic" | "premium"

type SubscriptionContextType = {
  tier: SubscriptionTier
  isLoading: boolean
  isSubscribed: boolean
  isPremium: boolean
  features: {
    maxBirthdays: number
    notifications: boolean
    customCategories: boolean
    exportData: boolean
    removeAds: boolean
    prioritySupport: boolean
  }
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

const TIER_FEATURES = {
  free: {
    maxBirthdays: 10,
    notifications: false,
    customCategories: false,
    exportData: true,
    removeAds: false,
    prioritySupport: false,
  },
  basic: {
    maxBirthdays: 50,
    notifications: true,
    customCategories: true,
    exportData: true,
    removeAds: true,
    prioritySupport: false,
  },
  premium: {
    maxBirthdays: 500,
    notifications: true,
    customCategories: true,
    exportData: true,
    removeAds: true,
    prioritySupport: true,
  },
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [tier, setTier] = useState<SubscriptionTier>("free")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setTier("free")
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single()

        if (error) throw error

        setTier((data?.tier as SubscriptionTier) || "free")
      } catch (error) {
        console.error("Error fetching subscription:", error)
        setTier("free")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  const value = {
    tier,
    isLoading,
    isSubscribed: tier !== "free",
    isPremium: tier === "premium",
    features: TIER_FEATURES[tier],
  }

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}
