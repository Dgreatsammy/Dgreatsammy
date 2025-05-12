import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { paymentService } from "@/services/payment-service"
import type { PaymentMethod } from "@/types/payment"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { tier, paymentMethod } = await request.json()

    if (!tier || !paymentMethod) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const { paymentIntent, redirectUrl } = await paymentService.createPaymentIntent({
      userId: session.user.id,
      tier,
      paymentMethod: paymentMethod as PaymentMethod,
      customerEmail: session.user.email,
      customerName: session.user.email.split("@")[0], // Fallback name
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback?payment_intent_id=${paymentIntent.id}`,
    })

    return NextResponse.json({ paymentIntentId: paymentIntent.id, redirectUrl })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
