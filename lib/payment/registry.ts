import type { PaymentProvider } from "./types"
import { PaystackProvider } from "./providers/paystack"

// Registry of all available payment providers
const providerClasses: Record<string, new () => PaymentProvider> = {
  paystack: PaystackProvider,
}

// Provider instances cache
const providerInstances: Record<string, PaymentProvider> = {}

// Get a payment provider by name
export async function getPaymentProvider(name: string): Promise<PaymentProvider | null> {
  // Return from cache if available
  if (providerInstances[name]) {
    return providerInstances[name]
  }

  // Create new instance if provider class exists
  const ProviderClass = providerClasses[name]
  if (ProviderClass) {
    const provider = new ProviderClass()

    // Only cache if the provider is enabled
    if (await provider.isEnabled()) {
      providerInstances[name] = provider
      return provider
    }

    return provider
  }

  return null
}

// Get all available payment providers
export async function getAllPaymentProviders(): Promise<PaymentProvider[]> {
  const providers: PaymentProvider[] = []

  for (const name of Object.keys(providerClasses)) {
    const provider = await getPaymentProvider(name)
    if (provider && (await provider.isEnabled())) {
      providers.push(provider)
    }
  }

  return providers
}

// Register a new payment provider
export function registerPaymentProvider(name: string, providerClass: new () => PaymentProvider): void {
  providerClasses[name] = providerClass
  // Clear cache for this provider
  delete providerInstances[name]
}
