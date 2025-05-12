"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Upload, CreditCard, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import type { Person } from "@/types/person"
import NotificationChannels from "@/components/notification-channels"
import { useAuth } from "@/contexts/auth-context"
import type { SubscriptionTier } from "@/contexts/subscription-context"
import type { User } from "@supabase/supabase-js"

interface ProfileViewProps {
  people: Person[]
  onDelete: (id: string) => void
  onImport: () => void
  user: User | null
  tier: SubscriptionTier
  features: {
    maxBirthdays: number
    notifications: boolean
    customCategories: boolean
    exportData: boolean
    removeAds: boolean
    prioritySupport: boolean
  }
}

export default function ProfileView({ people, onDelete, onImport, user, tier, features }: ProfileViewProps) {
  const [notifyDay, setNotifyDay] = useState(true)
  const [notifyBefore, setNotifyBefore] = useState(true)
  const [notifyWeek, setNotifyWeek] = useState(false)
  const { signOut } = useAuth()
  const router = useRouter()

  const exportData = () => {
    const dataStr = JSON.stringify(people, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `birthday-data-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const birthdayUsage = Math.round((people.length / features.maxBirthdays) * 100)

  return (
    <div className="space-y-6">
      {user && (
        <Card className="border-festive-purple/20">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-festive-purple mb-4">Account</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Signed in as: {user.email}</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{tier.charAt(0).toUpperCase() + tier.slice(1)} Plan</p>
                  <p className="text-sm text-gray-500">
                    {people.length} / {features.maxBirthdays} birthdays
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/pricing")}
                  variant="outline"
                  className="border-festive-purple text-festive-purple hover:bg-festive-cream"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {tier === "free" ? "Upgrade" : "Manage"}
                </Button>
              </div>
              <Progress value={birthdayUsage} className="h-2 mt-2" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button
                onClick={() => signOut()}
                variant="ghost"
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-festive-purple/20">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold text-festive-purple mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-day">On birthday</Label>
                <p className="text-sm text-gray-500">Get notified on the day</p>
              </div>
              <Switch
                id="notify-day"
                checked={notifyDay}
                onCheckedChange={setNotifyDay}
                disabled={!features.notifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-before">Day before</Label>
                <p className="text-sm text-gray-500">Get notified 1 day before</p>
              </div>
              <Switch
                id="notify-before"
                checked={notifyBefore}
                onCheckedChange={setNotifyBefore}
                disabled={!features.notifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-week">Week before</Label>
                <p className="text-sm text-gray-500">Get notified 1 week before</p>
              </div>
              <Switch
                id="notify-week"
                checked={notifyWeek}
                onCheckedChange={setNotifyWeek}
                disabled={!features.notifications}
              />
            </div>

            {!features.notifications && (
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                <p>
                  Upgrade to enable notifications.{" "}
                  <button
                    onClick={() => router.push("/pricing")}
                    className="text-festive-purple hover:text-festive-pink underline"
                  >
                    View plans
                  </button>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {features.notifications && <NotificationChannels />}

      <Card className="border-festive-purple/20">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold text-festive-purple mb-4">Data Management</h2>
          <div className="space-y-3">
            <Button
              onClick={onImport}
              className="w-full bg-white border-festive-purple text-festive-purple hover:bg-festive-cream"
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" /> Import Birthdays
            </Button>
            {features.exportData && (
              <Button
                onClick={exportData}
                className="w-full bg-white border-festive-purple text-festive-purple hover:bg-festive-cream"
                variant="outline"
              >
                Export Birthdays
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-festive-purple/20 border-2 shadow-md">
        <CardContent className="p-4 bg-festive-cream">
          <h2 className="text-lg font-semibold text-festive-purple mb-4">Manage Birthdays</h2>
          <div className="space-y-2">
            {people.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No birthdays added yet</p>
            ) : (
              people.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-festive-purple/10"
                >
                  <div>
                    <p className="font-medium text-gray-800">{person.name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(person.id)}
                    className="h-8 w-8 text-gray-400 hover:text-festive-pink hover:bg-festive-pink/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
