import { supabase } from "@/lib/supabase"

export interface PaymentIntent {
  id: string
  userId: string
  amount: number
  currency: string
  status: "pending" | "successful" | "failed" | "canceled"
  provider: string
  providerReference: string
  redirectUrl?: string
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  userId: string
  tier: string
  status: "active" | "canceled" | "past_due" | "incomplete"
  currentPeriodEnd: string
  paymentProvider: string
  paymentReference: string
  createdAt: string
  updatedAt: string
}

export const paymentDbService = {
  // Create a payment intent record
  async createPaymentIntent({
    userId,
    amount,
    currency,
    provider,
    providerReference,
    redirectUrl,
    metadata,
  }: {
    userId: string
    amount: number
    currency: string
    provider: string
    providerReference: string
    redirectUrl?: string
    metadata: Record<string, any>
  }): Promise<PaymentIntent> {
    const { data, error } = await supabase
      .from("payment_intents")
      .insert({
        user_id: userId,
        amount,
        currency,
        status: "pending",
        provider,
        provider_reference: providerReference,
        redirect_url: redirectUrl,
        metadata,
      })
      .select()
      .single()

    if (error) throw error
    return mapPaymentIntentFromDb(data)
  },

  // Update a payment intent status
  async updatePaymentIntentStatus({
    id,
    status,
  }: {
    id: string
    status: "pending" | "successful" | "failed" | "canceled"
  }): Promise<void> {
    const { error } = await supabase
      .from("payment_intents")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error
  },

  // Get a payment intent by ID
  async getPaymentIntent(id: string): Promise<PaymentIntent | null> {
    const { data, error } = await supabase.from("payment_intents").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") return null // Record not found
      throw error
    }

    return mapPaymentIntentFromDb(data)
  },

  // Get a payment intent by provider reference
  async getPaymentIntentByProviderReference({
    provider,
    reference,
  }: {
    provider: string
    reference: string
  }): Promise<PaymentIntent | null> {
    const { data, error } = await supabase
      .from("payment_intents")
      .select("*")
      .eq("provider", provider)
      .eq("provider_reference", reference)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null // Record not found
      throw error
    }

    return mapPaymentIntentFromDb(data)
  },

  // Create or update a subscription
  async upsertSubscription({
    userId,
    tier,
    status,
    currentPeriodEnd,
    paymentProvider,
    paymentReference,
  }: {
    userId: string
    tier: string
    status: "active" | "canceled" | "past_due" | "incomplete"
    currentPeriodEnd: string
    paymentProvider: string
    paymentReference: string
  }): Promise<Subscription> {
    const { data, error } = await supabase
      .from("subscriptions")
      .upsert({
        user_id: userId,
        tier,
        status,
        current_period_end: currentPeriodEnd,
        payment_provider: paymentProvider,
        payment_reference: paymentReference,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return mapSubscriptionFromDb(data)
  },

  // Get a user's active subscription
  async getUserActiveSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single()

    if (error) {
      if (error.code === "PGRST116") return null // Record not found
      throw error
    }

    return mapSubscriptionFromDb(data)
  },
}

// Helper functions to map database records to TypeScript interfaces
function mapPaymentIntentFromDb(data: any): PaymentIntent {
  return {
    id: data.id,
    userId: data.user_id,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    provider: data.provider,
    providerReference: data.provider_reference,
    redirectUrl: data.redirect_url,
    metadata: data.metadata || {},
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function mapSubscriptionFromDb(data: any): Subscription {
  return {
    id: data.id,
    userId: data.user_id,
    tier: data.tier,
    status: data.status,
    currentPeriodEnd: data.current_period_end,
    paymentProvider: data.payment_provider,
    paymentReference: data.payment_reference,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
