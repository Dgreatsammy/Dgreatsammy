"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import type { PaymentConfig } from "@/lib/payment/types"

export default function PaymentProvidersPage() {
  const [config, setConfig] = useState<PaymentConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/admin/payment-config")
        const data = await response.json()

        if (data.success) {
          setConfig(data.config)
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to load payment configuration",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching payment config:", error)
        toast({
          title: "Error",
          description: "Failed to load payment configuration",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchConfig()
  }, [toast])

  const handleToggleProvider = (providerName: string) => {
    if (!config) return

    setConfig({
      ...config,
      providers: {
        ...config.providers,
        [providerName]: {
          ...config.providers[providerName],
          enabled: !config.providers[providerName].enabled,
        },
      },
    })
  }

  const handleApiKeyChange = (providerName: string, keyName: string, value: string) => {
    if (!config) return

    setConfig({
      ...config,
      providers: {
        ...config.providers,
        [providerName]: {
          ...config.providers[providerName],
          apiKeys: {
            ...config.providers[providerName].apiKeys,
            [keyName]: value,
          },
        },
      },
    })
  }

  const handleWebhookSecretChange = (providerName: string, value: string) => {
    if (!config) return

    setConfig({
      ...config,
      providers: {
        ...config.providers,
        [providerName]: {
          ...config.providers[providerName],
          webhookSecret: value,
        },
      },
    })
  }

  const handleDefaultProviderChange = (providerName: string) => {
    if (!config) return

    setConfig({
      ...config,
      defaultProvider: providerName,
    })
  }

  const handleDefaultCurrencyChange = (currency: string) => {
    if (!config) return

    setConfig({
      ...config,
      defaultCurrency: currency,
    })
  }

  const handleSaveConfig = async () => {
    if (!config) return

    setIsSaving(true)

    try {
      const response = await fetch("/api/admin/payment-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ config }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Payment configuration saved successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save payment configuration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving payment config:", error)
      toast({
        title: "Error",
        description: "Failed to save payment configuration",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-festive-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-festive-purple animate-spin" />
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-festive-cream p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-festive-purple/20">
            <CardContent className="pt-6 text-center">
              <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Configuration Error</h2>
              <p className="text-gray-600 mb-6">Failed to load payment configuration</p>
              <Button onClick={() => router.push("/")} variant="outline">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-festive-cream p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-festive-purple mb-6">Payment Provider Settings</h1>

        <div className="space-y-6">
          <Card className="border-festive-purple/20">
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
              <CardDescription>Configure default payment options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultProvider">Default Payment Provider</Label>
                <select
                  id="defaultProvider"
                  value={config.defaultProvider}
                  onChange={(e) => handleDefaultProviderChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {Object.keys(config.providers).map((providerName) => (
                    <option key={providerName} value={providerName}>
                      {providerName.charAt(0).toUpperCase() + providerName.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <select
                  id="defaultCurrency"
                  value={config.defaultCurrency}
                  onChange={(e) => handleDefaultCurrencyChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="NGN">NGN - Nigerian Naira</option>
                  <option value="GHS">GHS - Ghanaian Cedi</option>
                  <option value="KES">KES - Kenyan Shilling</option>
                  <option value="ZAR">ZAR - South African Rand</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {Object.entries(config.providers).map(([providerName, providerConfig]) => (
            <Card key={providerName} className="border-festive-purple/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{providerName.charAt(0).toUpperCase() + providerName.slice(1)}</CardTitle>
                  <Switch checked={providerConfig.enabled} onCheckedChange={() => handleToggleProvider(providerName)} />
                </div>
                <CardDescription>
                  {providerConfig.enabled ? "Enabled" : "Disabled"} • {providerConfig.supportedMethods.join(", ")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(providerConfig.apiKeys).map(([keyName, keyValue]) => (
                  <div key={keyName} className="space-y-2">
                    <Label htmlFor={`${providerName}-${keyName}`}>
                      {keyName.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </Label>
                    <Input
                      id={`${providerName}-${keyName}`}
                      type="password"
                      value={keyValue as string}
                      onChange={(e) => handleApiKeyChange(providerName, keyName, e.target.value)}
                      placeholder={`Enter ${keyName}`}
                      className="border-gray-200 focus-visible:ring-festive-purple"
                    />
                  </div>
                ))}

                {providerConfig.webhookSecret !== undefined && (
                  <div className="space-y-2">
                    <Label htmlFor={`${providerName}-webhookSecret`}>Webhook Secret</Label>
                    <Input
                      id={`${providerName}-webhookSecret`}
                      type="password"
                      value={providerConfig.webhookSecret || ""}
                      onChange={(e) => handleWebhookSecretChange(providerName, e.target.value)}
                      placeholder="Enter webhook secret"
                      className="border-gray-200 focus-visible:ring-festive-purple"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-sm text-gray-500">Test Mode: {providerConfig.testMode ? "Enabled" : "Disabled"}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end">
            <Button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="bg-gradient-to-r from-festive-purple to-festive-pink hover:opacity-90 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Configuration
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
