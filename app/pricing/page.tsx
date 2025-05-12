"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, Sparkles, CreditCard, Wallet, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/contexts/subscription-context"
import { useToast } from "@/hooks/use-toast"
import type { PaymentMethod } from "@/lib/payment/types"

const pricingPlans = [
  {
    name: "Free",
    description: "Basic birthday tracking",
    price: "$0",
    interval: "forever",
    features: ["Track up to 10 birthdays", "Basic calendar view", "Export data"],
    buttonText: "Current Plan",
    planId: "free",
    highlight: false,
  },
  {
    name: "Basic",
    description: "For birthday enthusiasts",
    price: "$4.99",
    interval: "month",
    features: [
      "Track up to 50 birthdays",
      "Birthday notifications",
      "Custom categories",
      "Ad-free experience",
      "Export data",
    ],
    buttonText: "Subscribe",
    planId: "basic",
    highlight: true,
  },
  {
    name: "Premium",
    description: "For the ultimate birthday planner",
    price: "$9.99",
    interval: "month",
    features: [
      "Track up to 500 birthdays",
      "Advanced notifications",
      "Custom categories",
      "Ad-free experience",
      "Export data",
      "Priority support",
      "Early access to new features",
    ],
    buttonText: "Subscribe",
    planId: "premium",
    highlight: false,
  },
]

interface PaymentProvider {
  name: string
  displayName: string
  description: string
  logo: string
  supportedMethods: PaymentMethod[]
  supportedCurrencies: string[]
}

export default function PricingPage() {
  const { user } = useAuth()
  const { tier } = useSubscription()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [providers, setProviders] = useState<PaymentProvider[]>([])
  const [isLoadingProviders, setIsLoadingProviders] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProviders = async () => {
      if (!user) return

      setIsLoadingProviders(true)
      try {
        const response = await fetch("/api/payments/providers")
        const data = await response.json()

        if (data.providers) {
          setProviders(data.providers)

          // Set default provider if available
          if (data.providers.length > 0) {
            setSelectedProvider(data.providers[0].name)

            // Set default payment method if available
            if (data.providers[0].supportedMethods.length > 0) {
              setSelectedPaymentMethod(data.providers[0].supportedMethods[0])
            }
          }
        }
      } catch (error) {
        console.error("Error fetching payment providers:", error)
      } finally {
        setIsLoadingProviders(false)
      }
    }

    fetchProviders()
  }, [user])

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push("/login?redirectTo=/pricing")
      return
    }

    setSelectedPlan(planId)
  }

  const handlePayment = async () => {
    if (!selectedPlan || !selectedProvider || !selectedPaymentMethod || !user) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier: selectedPlan,
          providerName: selectedProvider,
          paymentMethod: selectedPaymentMethod,
        }),
      })

      const data = await response.json()

      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to process payment. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating payment:", error)
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/payments/cancel", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Subscription Canceled",
          description: "Your subscription has been canceled successfully.",
        })
        // Refresh the page to update subscription status
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to cancel subscription. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error canceling subscription:", error)
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getProviderMethods = (providerName: string): PaymentMethod[] => {
    const provider = providers.find((p) => p.name === providerName)
    return provider ? provider.supportedMethods : []
  }

  return (
    <div className="min-h-screen bg-festive-cream">
      <div className="max-w-6xl mx-auto p-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-festive-pink" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-festive-purple to-festive-pink bg-clip-text text-transparent">
              BIRTHDAY BLISS BUDDIES
            </h1>
            <Sparkles className="h-6 w-6 text-festive-purple" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan to keep track of all your important birthdays and never miss a celebration again.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`border ${
                plan.highlight ? "border-festive-pink shadow-lg shadow-festive-pink/10" : "border-festive-purple/20"
              }`}
            >
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-800">{plan.price}</span>
                  <span className="text-gray-500 ml-2">/{plan.interval}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-4 w-4 text-festive-pink mr-2" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {tier === plan.planId ? (
                  <Button className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-default" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan.planId)}
                    disabled={isLoading || plan.planId === "free"}
                    className={`w-full ${
                      plan.highlight
                        ? "bg-gradient-to-r from-festive-purple to-festive-pink hover:opacity-90 text-white"
                        : "bg-white border border-festive-purple text-festive-purple hover:bg-festive-cream"
                    }`}
                  >
                    {isLoading && selectedPlan === plan.planId ? "Processing..." : plan.buttonText}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {user && tier !== "free" && (
          <div className="mt-12 text-center">
            <Button
              onClick={handleCancelSubscription}
              disabled={isLoading}
              variant="outline"
              className="border-festive-purple text-festive-purple hover:bg-festive-cream"
            >
              {isLoading ? "Processing..." : "Cancel Subscription"}
            </Button>
          </div>
        )}

        {selectedPlan && selectedPlan !== "free" && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-festive-purple/20 shadow-lg">
              <CardHeader>
                <CardTitle>Choose Payment Method</CardTitle>
                <CardDescription>
                  Select how you'd like to pay for your {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}{" "}
                  plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProviders ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 text-festive-purple animate-spin" />
                  </div>
                ) : providers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No payment providers available</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payment Provider</label>
                      <div className="grid grid-cols-2 gap-2">
                        {providers.map((provider) => (
                          <div
                            key={provider.name}
                            className={`p-3 border rounded-lg cursor-pointer flex flex-col items-center ${
                              selectedProvider === provider.name
                                ? "border-festive-pink bg-festive-pink/5"
                                : "border-gray-200 hover:border-festive-purple/20"
                            }`}
                            onClick={() => {
                              setSelectedProvider(provider.name)
                              if (provider.supportedMethods.length > 0) {
                                setSelectedPaymentMethod(provider.supportedMethods[0])
                              }
                            }}
                          >
                            <img
                              src={provider.logo || `/payment-logos/${provider.name}.svg`}
                              alt={provider.displayName}
                              className="h-8 mb-2"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg?height=32&width=32"
                              }}
                            />
                            <span className="text-sm">{provider.displayName}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedProvider && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Payment Method</label>
                        <div className="grid grid-cols-2 gap-2">
                          {getProviderMethods(selectedProvider).map((method) => (
                            <div
                              key={method}
                              className={`p-3 border rounded-lg cursor-pointer ${
                                selectedPaymentMethod === method
                                  ? "border-festive-pink bg-festive-pink/5"
                                  : "border-gray-200 hover:border-festive-purple/20"
                              }`}
                              onClick={() => setSelectedPaymentMethod(method)}
                            >
                              <div className="flex items-center gap-2">
                                {method === "card" && <CreditCard className="h-4 w-4 text-festive-purple" />}
                                {method === "bank" && <Wallet className="h-4 w-4 text-festive-purple" />}
                                {method === "mobile_money" && <Wallet className="h-4 w-4 text-festive-purple" />}
                                {method === "ussd" && <CreditCard className="h-4 w-4 text-festive-purple" />}
                                <span className="text-sm capitalize">{method.replace("_", " ")}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPlan(null)}
                  className="border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={isLoading || !selectedProvider || !selectedPaymentMethod || isLoadingProviders}
                  className="bg-gradient-to-r from-festive-purple to-festive-pink hover:opacity-90 text-white"
                >
                  {isLoading ? "Processing..." : "Continue to Payment"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
