"use client"

import type React from "react"

import { useState } from "react"
import { Check, MessageSquare, Facebook, Mail, Phone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface NotificationChannel {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
  configured: boolean
  contactInfo?: string
}

export default function NotificationChannels() {
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: "whatsapp",
      name: "WhatsApp",
      description: "Receive notifications via WhatsApp",
      icon: <MessageSquare className="h-5 w-5 text-green-500" />,
      enabled: false,
      configured: false,
    },
    {
      id: "facebook",
      name: "Facebook",
      description: "Receive notifications via Facebook",
      icon: <Facebook className="h-5 w-5 text-blue-600" />,
      enabled: false,
      configured: false,
    },
    {
      id: "email",
      name: "Email",
      description: "Receive notifications via email",
      icon: <Mail className="h-5 w-5 text-festive-purple" />,
      enabled: false,
      configured: false,
    },
    {
      id: "sms",
      name: "SMS",
      description: "Receive notifications via SMS",
      icon: <Phone className="h-5 w-5 text-festive-pink" />,
      enabled: false,
      configured: false,
    },
  ])

  const [activeConfig, setActiveConfig] = useState<string | null>(null)
  const [contactInput, setContactInput] = useState<string>("")

  const toggleChannel = (id: string) => {
    setChannels(channels.map((channel) => (channel.id === id ? { ...channel, enabled: !channel.enabled } : channel)))
  }

  const configureChannel = (id: string) => {
    setActiveConfig(id)
    const channel = channels.find((c) => c.id === id)
    setContactInput(channel?.contactInfo || "")
  }

  const saveConfiguration = () => {
    if (!activeConfig) return

    setChannels(
      channels.map((channel) =>
        channel.id === activeConfig ? { ...channel, configured: !!contactInput, contactInfo: contactInput } : channel,
      ),
    )
    setActiveConfig(null)
    setContactInput("")
  }

  const cancelConfiguration = () => {
    setActiveConfig(null)
    setContactInput("")
  }

  const getPlaceholder = (id: string) => {
    switch (id) {
      case "whatsapp":
        return "+1 (555) 123-4567"
      case "facebook":
        return "username or profile URL"
      case "email":
        return "example@email.com"
      case "sms":
        return "+1 (555) 123-4567"
      default:
        return ""
    }
  }

  const getInputType = (id: string) => {
    switch (id) {
      case "email":
        return "email"
      case "whatsapp":
      case "sms":
        return "tel"
      default:
        return "text"
    }
  }

  return (
    <Card className="border-festive-purple/20">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold text-festive-purple mb-4">Notification Channels</h2>
        <p className="text-sm text-gray-500 mb-4">
          Choose how you'd like to receive notifications and share birthday wishes
        </p>

        <div className="space-y-4">
          {channels.map((channel) => (
            <div key={channel.id} className="border rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {channel.icon}
                  <div>
                    <h3 className="font-medium text-gray-800">{channel.name}</h3>
                    <p className="text-xs text-gray-500">{channel.description}</p>
                  </div>
                </div>
                <Switch
                  checked={channel.enabled}
                  onCheckedChange={() => toggleChannel(channel.id)}
                  disabled={!channel.configured && channel.id !== "facebook"}
                />
              </div>

              {activeConfig === channel.id ? (
                <div className="mt-3 space-y-3">
                  <div>
                    <Label htmlFor={`${channel.id}-input`} className="text-sm text-gray-700">
                      {channel.id === "whatsapp" || channel.id === "sms"
                        ? "Phone Number"
                        : channel.id === "email"
                          ? "Email Address"
                          : "Facebook Username"}
                    </Label>
                    <Input
                      id={`${channel.id}-input`}
                      type={getInputType(channel.id)}
                      placeholder={getPlaceholder(channel.id)}
                      value={contactInput}
                      onChange={(e) => setContactInput(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={cancelConfiguration}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveConfiguration} disabled={!contactInput}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  {channel.configured ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="truncate max-w-[200px]">{channel.contactInfo}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => configureChannel(channel.id)}
                        className="text-xs text-festive-purple hover:text-festive-pink"
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => configureChannel(channel.id)}
                      className="w-full mt-1 border-festive-purple/30 text-festive-purple hover:bg-festive-cream"
                      disabled={channel.id === "facebook"}
                    >
                      {channel.id === "facebook" ? "Coming soon" : "Configure"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
