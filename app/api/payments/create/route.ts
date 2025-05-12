import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { paymentService } from "@/lib/payment/service"
import { paymentDbService } from "@/services/payment-db-service"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { tier, providerName, paymentMethod } = await request.json()

    if (!tier) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Determine amount based on tier
    const amount = tier === "premium" ? 9.99 : 4.99
    const currency = await paymentService.getDefaultCurrency()

    // Generate callback URL with a unique ID
    const callbackId = `cb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback?id=${callbackId}`
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`

    // Create payment with the payment service
    const paymentResult = await paymentService.createPayment({
      amount,
      currency,
      customerEmail: session.user.email,
      customerName: session.user.email.split("@")[0], // Fallback name
      description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Subscription`,
      metadata: {
        tier,
        userId: session.user.id,
        callbackId,
      },
      successUrl,
      cancelUrl,
      providerName,
      paymentMethod,
    })

    if (!paymentResult.success) {
      return NextResponse.json({ error: paymentResult.error }, { status: 400 })
    }

    // Store payment intent in database
    await paymentDbService.createPaymentIntent({
      userId: session.user.id,
      amount,
      currency,
      provider: paymentResult.providerName,
      providerReference: paymentResult.paymentId,
      redirectUrl: paymentResult.redirectUrl,
      metadata: {
        tier,
        callbackId,
      },
    })

    return NextResponse.json({
      success: true,
      redirectUrl: paymentResult.redirectUrl,
      paymentId: paymentResult.paymentId,
      provider: paymentResult.providerName,
    })
  } catch (error: any) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: error.message || "Failed to create payment" }, { status: 500 })
  }
}
