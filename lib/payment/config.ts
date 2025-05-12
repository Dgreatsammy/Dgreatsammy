import type { PaymentConfig } from "./types"

// Make sure the default config only includes Paystack

// Update the default payment configuration to only include Paystack
const defaultConfig: PaymentConfig = {
  providers: {
    paystack: {
      enabled: true,
      apiKeys: {
        publicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
        secretKey: process.env.PAYSTACK_SECRET_KEY || "",
      },
      supportedMethods: ["card", "bank", "mobile_money", "ussd"],
      supportedCurrencies: ["NGN", "USD", "GHS", "ZAR"],
      testMode: process.env.NODE_ENV !== "production",
    },
  },
  defaultProvider: "paystack",
  defaultCurrency: "USD",
}

// Load configuration from environment or database
export async function loadPaymentConfig(): Promise<PaymentConfig> {
  // In a real application, you might load this from a database
  // or a configuration file that can be modified by admins
  return defaultConfig
}

// Save configuration (for admin panel)
export async function savePaymentConfig(config: PaymentConfig): Promise<boolean> {
  // In a real application, you would save this to a database
  // or a configuration file
  console.log("Saving payment config:", config)
  return true
}

// Helper to check if a provider is properly configured
export function isProviderConfigured(config: PaymentConfig, providerName: string): boolean {
  const provider = config.providers[providerName]
  if (!provider || !provider.enabled) return false

  // Check if all required API keys are present
  const apiKeys = provider.apiKeys
  return Object.values(apiKeys).every((key) => key && key.length > 0)
}

// Get all enabled and configured providers
export function getEnabledProviders(config: PaymentConfig): string[] {
  return Object.keys(config.providers).filter((name) => isProviderConfigured(config, name))
}
