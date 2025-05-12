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

    const { paymentId, providerName, transactionId } = await request.json()

    if (!paymentId || !providerName) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Get payment intent from database
    const paymentIntent = await paymentDbService.getPaymentIntent(paymentId)

    if (!paymentIntent) {
      return NextResponse.json({ error: "Payment intent not found" }, { status: 404 })
    }

    // Verify that this payment intent belongs to the current user
    if (paymentIntent.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Verify payment with the payment service
    const verificationResult = await paymentService.verifyPayment({
      paymentId: paymentIntent.providerReference,
      providerName: paymentIntent.provider,
      transactionId,
    })

    // Update payment intent status in database
    await paymentDbService.updatePaymentIntentStatus({
      id: paymentIntent.id,
      status: verificationResult.status,
    })

    // If payment is successful, create or update subscription
    if (verificationResult.verified) {
      const tier = paymentIntent.metadata.tier
      const currentPeriodEnd = new Date()
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1) // 1 month subscription

      await paymentDbService.upsertSubscription({
        userId: session.user.id,
        tier,
        status: "active",
        currentPeriodEnd: currentPeriodEnd.toISOString(),
        paymentProvider: paymentIntent.provider,
        paymentReference: paymentIntent.providerReference,
      })
    }

    return NextResponse.json({
      success: true,
      verified: verificationResult.verified,
      status: verificationResult.status,
    })
  } catch (error: any) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: error.message || "Failed to verify payment" }, { status: 500 })
  }
}
