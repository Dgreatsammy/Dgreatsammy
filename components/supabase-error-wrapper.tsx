"use client"

import dynamic from "next/dynamic"

// Dynamically import the SupabaseError component with ssr: false
const SupabaseError = dynamic(() => import("@/components/supabase-error"), {
  ssr: false,
})

export default function SupabaseErrorWrapper() {
  return <SupabaseError />
}
