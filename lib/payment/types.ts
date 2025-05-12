export type PaymentMethod = "card" | "bank" | "mobile_money" | "crypto" | "ussd" | "qr"

export interface PaymentProviderConfig {
  enabled: boolean
  apiKeys: Record<string, string>
  webhookSecret?: string
  supportedMethods: PaymentMethod[]
  supportedCurrencies: string[]
  testMode: boolean
}

export interface PaymentConfig {
  providers: Record<string, PaymentProviderConfig>
  defaultProvider: string
  defaultCurrency: string
}

export interface CreatePaymentOptions {
  amount: number
  currency: string
  customerEmail: string
  customerName: string
  description: string
  metadata: Record<string, any>
  successUrl: string
  cancelUrl: string
  paymentMethod?: PaymentMethod
}

export interface PaymentResult {
  success: boolean
  paymentId: string
  redirectUrl?: string
  providerName: string
  error?: string
}

export interface VerifyPaymentOptions {
  paymentId: string
  providerName: string
  transactionId?: string
}

export interface VerifyPaymentResult {
  success: boolean
  verified: boolean
  status: "pending" | "successful" | "failed" | "canceled"
  metadata?: Record<string, any>
  error?: string
}

export interface PaymentProvider {
  name: string
  displayName: string
  description: string
  logo: string
  createPayment(options: CreatePaymentOptions): Promise<PaymentResult>
  verifyPayment(options: VerifyPaymentOptions): Promise<VerifyPaymentResult>
  getPaymentMethods(): PaymentMethod[]
  getSupportedCurrencies(): string[]
  isEnabled(): boolean
}
