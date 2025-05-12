export type PaymentMethod = "card" | "bank" | "mobile_money" | "ussd"

export type PaymentProvider = "paystack"

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: "pending" | "successful" | "failed" | "canceled"
  provider: PaymentProvider
  providerReference: string
  redirectUrl?: string
  createdAt: string
}

export interface SubscriptionPayment {
  id: string
  userId: string
  tier: string
  paymentIntentId: string
  status: "active" | "canceled" | "past_due" | "incomplete"
  currentPeriodEnd: string
  provider: PaymentProvider
  providerReference: string
  createdAt: string
  updatedAt: string
}
