// Payment service utility for payment providers
import type { PaymentMethod } from "@/types/payment"

// Base payment configuration
export const paymentConfig = {
  paystack: {
    publicKey: process.env.PAYSTACK_PUBLIC_KEY!,
    secretKey: process.env.PAYSTACK_SECRET_KEY!,
  },
}

// Payment plans configuration
export const paymentPlans = {
  basic: {
    name: "Basic",
    description: "For birthday enthusiasts",
    price: {
      fiat: {
        amount: 4.99,
        currency: "USD",
      },
    },
    interval: "month",
    paystackPlanId: "basic-monthly",
  },
  premium: {
    name: "Premium",
    description: "For the ultimate birthday planner",
    price: {
      fiat: {
        amount: 9.99,
        currency: "USD",
      },
    },
    interval: "month",
    paystackPlanId: "premium-monthly",
  },
}

// Helper function to get payment method details
export function getPaymentMethodDetails(method: PaymentMethod) {
  switch (method) {
    case "card":
      return {
        name: "Credit/Debit Card",
        description: "Pay with Visa, Mastercard, or Verve",
        icon: "credit-card",
      }
    case "bank":
      return {
        name: "Bank Transfer",
        description: "Pay directly from your bank account",
        icon: "building-bank",
      }
    default:
      return {
        name: "Other",
        description: "Alternative payment method",
        icon: "wallet",
      }
  }
}
