import axios from "axios"
import type {
  PaymentProvider,
  PaymentMethod,
  CreatePaymentOptions,
  PaymentResult,
  VerifyPaymentOptions,
  VerifyPaymentResult,
} from "../types"
import { loadPaymentConfig } from "../config"

const PAYSTACK_API_URL = "https://api.paystack.co"

export class PaystackProvider implements PaymentProvider {
  name = "paystack"
  displayName = "Paystack"
  description = "Accept payments via cards, bank transfers, and USSD"
  logo = "/payment-logos/paystack.svg"
  private config: any

  constructor() {
    // Config will be loaded when needed
  }

  private async getConfig() {
    if (!this.config) {
      const paymentConfig = await loadPaymentConfig()
      this.config = paymentConfig.providers.paystack
    }
    return this.config
  }

  private async getApiClient() {
    const config = await this.getConfig()
    return axios.create({
      baseURL: PAYSTACK_API_URL,
      headers: {
        Authorization: `Bearer ${config.apiKeys.secretKey}`,
        "Content-Type": "application/json",
      },
    })
  }

  async isEnabled(): Promise<boolean> {
    const config = await this.getConfig()
    return config.enabled
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const config = await this.getConfig()
    return config.supportedMethods
  }

  async getSupportedCurrencies(): Promise<string[]> {
    const config = await this.getConfig()
    return config.supportedCurrencies
  }

  async createPayment(options: CreatePaymentOptions): Promise<PaymentResult> {
    try {
      const client = await this.getApiClient()

      const payload = {
        email: options.customerEmail,
        amount: Math.round(options.amount * 100), // Paystack expects amount in kobo (smallest currency unit)
        currency: options.currency,
        callback_url: options.successUrl,
        metadata: {
          ...options.metadata,
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: options.customerName,
            },
          ],
        },
      }

      const response = await client.post("/transaction/initialize", payload)

      if (response.data.status) {
        return {
          success: true,
          paymentId: response.data.data.reference,
          redirectUrl: response.data.data.authorization_url,
          providerName: this.name,
        }
      } else {
        return {
          success: false,
          paymentId: "",
          providerName: this.name,
          error: response.data.message || "Payment initialization failed",
        }
      }
    } catch (error: any) {
      console.error("Paystack payment creation error:", error.response?.data || error.message)
      return {
        success: false,
        paymentId: "",
        providerName: this.name,
        error: error.response?.data?.message || error.message || "Payment creation failed",
      }
    }
  }

  async verifyPayment(options: VerifyPaymentOptions): Promise<VerifyPaymentResult> {
    try {
      const client = await this.getApiClient()
      const reference = options.transactionId || options.paymentId

      const response = await client.get(`/transaction/verify/${reference}`)

      if (response.data.status && response.data.data.status === "success") {
        return {
          success: true,
          verified: true,
          status: "successful",
          metadata: response.data.data.metadata || {},
        }
      } else {
        return {
          success: true,
          verified: false,
          status: response.data.data.status === "abandoned" ? "canceled" : "failed",
        }
      }
    } catch (error: any) {
      console.error("Paystack payment verification error:", error.response?.data || error.message)
      return {
        success: false,
        verified: false,
        status: "failed",
        error: error.response?.data?.message || error.message || "Payment verification failed",
      }
    }
  }
}
