import { supabase } from "@/lib/supabase"
import type { PaymentMethod, PaymentProvider } from "@/types/payment"

export const paymentService = {
  // Create a payment intent for subscription
  async createPaymentIntent({
    userId,
    tier,
    paymentMethod,
    customerEmail,
    customerName,
    redirectUrl,
  }: {
    userId: string
    tier: "basic" | "premium"
    paymentMethod: PaymentMethod
    customerEmail: string
    customerName: string
    redirectUrl: string
  }) {
    const amount = tier === "premium" ? 9.99 : 4.99
    const currency = "USD"
    const transactionRef = `sub_${tier}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    try {
      // Import the Paystack API client dynamically to avoid server-side issues
      const { default: axios } = await import("axios")

      // Create payment with Paystack
      const paystackClient = axios.create({
        baseURL: "https://api.paystack.co",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      })

      const paymentData = await paystackClient.post("/transaction/initialize", {
        email: customerEmail,
        amount: Math.round(amount * 100), // Paystack expects amount in kobo (smallest currency unit)
        currency,
        callback_url: redirectUrl,
        metadata: {
          tier,
          userId,
          customerName,
        },
      })

      // Save payment intent to database
      const { data: paymentIntent, error } = await supabase
        .from("payment_intents")
        .insert({
          user_id: userId,
          amount,
          currency,
          status: "pending",
          provider: "paystack" as PaymentProvider,
          provider_reference: paymentData.data.data.reference,
          redirect_url: paymentData.data.data.authorization_url,
          metadata: {
            tier,
            transactionRef,
          },
        })
        .select()
        .single()

      if (error) throw error

      return {
        paymentIntent,
        redirectUrl: paymentData.data.data.authorization_url,
      }
    } catch (error) {
      console.error("Error creating payment intent:", error)
      throw error
    }
  },

  // Verify payment status
  async verifyPayment(paymentIntentId: string) {
    try {
      // Get payment intent from database
      const { data: paymentIntent, error } = await supabase
        .from("payment_intents")
        .select("*")
        .eq("id", paymentIntentId)
        .single()

      if (error || !paymentIntent) throw new Error("Payment intent not found")

      // Import the Paystack API client dynamically to avoid server-side issues
      const { default: axios } = await import("axios")

      // Verify with Paystack
      const paystackClient = axios.create({
        baseURL: "https://api.paystack.co",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      })

      const verificationResult = await paystackClient.get(`/transaction/verify/${paymentIntent.provider_reference}`)
      const isSuccessful = verificationResult.data.status && verificationResult.data.data.status === "success"

      // Update payment intent status
      if (isSuccessful) {
        await supabase
          .from("payment_intents")
          .update({
            status: "successful",
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentIntentId)

        // Create or update subscription
        const tier = paymentIntent.metadata.tier
        const currentPeriodEnd = new Date()
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1) // 1 month subscription

        await supabase.from("subscriptions").upsert({
          user_id: paymentIntent.user_id,
          tier,
          status: "active",
          current_period_end: currentPeriodEnd.toISOString(),
          payment_provider: "paystack",
          payment_reference: paymentIntent.provider_reference,
          updated_at: new Date().toISOString(),
        })
      }

      return { isSuccessful, paymentIntent }
    } catch (error) {
      console.error("Error verifying payment:", error)
      throw error
    }
  },

  // Cancel subscription
  async cancelSubscription(userId: string) {
    try {
      // Get subscription from database
      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .single()

      if (error || !subscription) throw new Error("Active subscription not found")

      // Update subscription status
      await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscription.id)

      return { success: true }
    } catch (error) {
      console.error("Error canceling subscription:", error)
      throw error
    }
  },
}
