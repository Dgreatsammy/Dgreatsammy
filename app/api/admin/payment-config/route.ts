import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { loadPaymentConfig, savePaymentConfig } from "@/lib/payment/config"

// Helper to check if user is admin
async function isAdmin(userId: string) {
  // In a real app, you would check if the user has admin privileges
  // For now, we'll just return true for simplicity
  return true
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if user is admin
    const admin = await isAdmin(session.user.id)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const config = await loadPaymentConfig()

    return NextResponse.json({
      success: true,
      config,
    })
  } catch (error: any) {
    console.error("Error loading payment config:", error)
    return NextResponse.json({ error: error.message || "Failed to load payment configuration" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if user is admin
    const admin = await isAdmin(session.user.id)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { config } = await request.json()

    if (!config) {
      return NextResponse.json({ error: "Missing configuration" }, { status: 400 })
    }

    await savePaymentConfig(config)

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error("Error saving payment config:", error)
    return NextResponse.json({ error: error.message || "Failed to save payment configuration" }, { status: 500 })
  }
}
