import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { paymentDbService } from "@/services/payment-db-service"

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const url = new URL(request.url)
    const callbackId = url.searchParams.get("callbackId")

    if (!callbackId) {
      return NextResponse.json({ error: "Missing callback ID" }, { status: 400 })
    }

    // Find payment intent by metadata.callbackId
    const { data: paymentIntents, error } = await supabase
      .from("payment_intents")
      .select("*")
      .eq("user_id", session.user.id)
      .filter("metadata->callbackId", "eq", callbackId)
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!paymentIntents || paymentIntents.length === 0) {
      return NextResponse.json({ error: "Payment intent not found" }, { status: 404 })
    }

    const paymentIntent = paymentDbService.mapPaymentIntentFromDb(paymentIntents[0])

    return NextResponse.json({
      success: true,
      paymentIntent,
    })
  } catch (error: any) {
    console.error("Error fetching payment callback:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch payment callback" }, { status: 500 })
  }
}
