import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase admin client
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    // Verify the signature (in a production environment, you should verify the signature)
    // const signature = request.headers.get("x-paystack-signature")

    // Handle the event
    if (payload.event === "charge.success") {
      const reference = payload.data.reference

      // Find the payment intent
      const { data: paymentIntent } = await supabaseAdmin
        .from("payment_intents")
        .select("*")
        .eq("provider", "paystack")
        .eq("provider_reference", reference)
        .single()

      if (paymentIntent) {
        // Update payment intent status
        await supabaseAdmin
          .from("payment_intents")
          .update({
            status: "successful",
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentIntent.id)

        // Create or update subscription
        const tier = paymentIntent.metadata.tier
        const currentPeriodEnd = new Date()
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1) // 1 month subscription

        await supabaseAdmin.from("subscriptions").upsert({
          user_id: paymentIntent.user_id,
          tier,
          status: "active",
          current_period_end: currentPeriodEnd.toISOString(),
          payment_provider: "paystack",
          payment_reference: reference,
          updated_at: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing Paystack webhook:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
