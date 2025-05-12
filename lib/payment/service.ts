import { getPaymentProvider, getAllPaymentProviders } from "./registry"
import { loadPaymentConfig } from "./config"
import type {
  CreatePaymentOptions,
  PaymentResult,
  VerifyPaymentOptions,
  VerifyPaymentResult,
  PaymentMethod,
  PaymentProvider,
} from "./types"

export class PaymentService {
  // Create a payment with the specified provider or default provider
  async createPayment(options: CreatePaymentOptions & { providerName?: string }): Promise<PaymentResult> {
    try {
      const config = await loadPaymentConfig()
      const providerName = options.providerName || config.defaultProvider

      const provider = await getPaymentProvider(providerName)
      if (!provider) {
        return {
          success: false,
          paymentId: "",
          providerName: providerName,
          error: `Payment provider '${providerName}' not found or not enabled`,
        }
      }

      return await provider.createPayment(options)
    } catch (error: any) {
      console.error("Payment creation error:", error)
      return {
        success: false,
        paymentId: "",
        providerName: options.providerName || "unknown",
        error: error.message || "An unexpected error occurred",
      }
    }
  }

  // Verify a payment
  async verifyPayment(options: VerifyPaymentOptions): Promise<VerifyPaymentResult> {
    try {
      const provider = await getPaymentProvider(options.providerName)
      if (!provider) {
        return {
          success: false,
          verified: false,
          status: "failed",
          error: `Payment provider '${options.providerName}' not found or not enabled`,
        }
      }

      return await provider.verifyPayment(options)
    } catch (error: any) {
      console.error("Payment verification error:", error)
      return {
        success: false,
        verified: false,
        status: "failed",
        error: error.message || "An unexpected error occurred",
      }
    }
  }

  // Get all available payment methods across all enabled providers
  async getAllPaymentMethods(): Promise<Record<string, PaymentMethod[]>> {
    const providers = await getAllPaymentProviders()
    const result: Record<string, PaymentMethod[]> = {}

    for (const provider of providers) {
      result[provider.name] = await provider.getPaymentMethods()
    }

    return result
  }

  // Get all available payment providers
  async getAvailableProviders(): Promise<PaymentProvider[]> {
    return await getAllPaymentProviders()
  }

  // Get default currency
  async getDefaultCurrency(): Promise<string> {
    const config = await loadPaymentConfig()
    return config.defaultCurrency
  }
}

// Create a singleton instance
export const paymentService = new PaymentService()
