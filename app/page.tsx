"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { isBefore, addYears, parseISO, isSameMonth } from "date-fns"
import { PlusCircle, Gift, Calendar, User, Sparkles, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import AddBirthdayForm from "@/components/add-birthday-form"
import TodaysBirthday from "@/components/todays-birthday"
import UpcomingBirthdays from "@/components/upcoming-birthdays"
import CalendarView from "@/components/calendar-view"
import ProfileView from "@/components/profile-view"
import type { Person } from "@/types/person"
import ImportDataModal from "@/components/import-data-modal"
import { useToast } from "@/hooks/use-toast"
import ConfettiBackground from "@/components/confetti-background"
import { getDaysUntilBirthday, isBirthdayToday } from "@/utils/date-utils"
import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/contexts/subscription-context"
import { birthdayService } from "@/services/birthday-service"

export default function Home() {
  const [people, setPeople] = useState<Person[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showImportModal, setShowImportModal] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()
  const { tier, features, isSubscribed } = useSubscription()
  const router = useRouter()

  useEffect(() => {
    const fetchBirthdays = async () => {
      if (!user) {
        // If not logged in, try to get from localStorage for backward compatibility
        const savedPeople = localStorage.getItem("birthdayPeople")
        if (savedPeople) {
          setPeople(JSON.parse(savedPeople))
        }
        setIsLoading(false)
        return
      }

      try {
        const birthdays = await birthdayService.getBirthdays(user.id)
        setPeople(birthdays)
      } catch (error) {
        console.error("Error fetching birthdays:", error)
        toast({
          title: "Error",
          description: "Failed to load birthdays. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBirthdays()
  }, [user, toast])

  const addPerson = async (person: Omit<Person, "id">) => {
    if (people.length >= features.maxBirthdays) {
      toast({
        title: "Limit Reached",
        description: `Your ${tier} plan allows up to ${features.maxBirthdays} birthdays. Upgrade for more!`,
        variant: "destructive",
      })
      return
    }

    try {
      if (user) {
        const newPerson = await birthdayService.addBirthday(person, user.id)
        setPeople([...people, newPerson])
      } else {
        // Fallback to localStorage if not logged in
        const newPerson = { ...person, id: Date.now().toString() }
        const updatedPeople = [...people, newPerson]
        setPeople(updatedPeople)
        localStorage.setItem("birthdayPeople", JSON.stringify(updatedPeople))
      }

      setShowAddForm(false)
      toast({
        title: "Birthday Added",
        description: `${person.name}'s birthday has been added successfully!`,
      })
    } catch (error) {
      console.error("Error adding birthday:", error)
      toast({
        title: "Error",
        description: "Failed to add birthday. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deletePerson = async (id: string) => {
    const personToDelete = people.find((person) => person.id === id)
    if (!personToDelete) return

    try {
      if (user) {
        await birthdayService.deleteBirthday(id, user.id)
      }

      const updatedPeople = people.filter((person) => person.id !== id)
      setPeople(updatedPeople)

      // Update localStorage if not logged in
      if (!user) {
        localStorage.setItem("birthdayPeople", JSON.stringify(updatedPeople))
      }

      toast({
        title: "Birthday Removed",
        description: `${personToDelete.name}'s birthday has been removed.`,
        variant: "destructive",
      })
    } catch (error) {
      console.error("Error deleting birthday:", error)
      toast({
        title: "Error",
        description: "Failed to delete birthday. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBulkImport = async (importedPeople: Person[]) => {
    if (people.length + importedPeople.length > features.maxBirthdays) {
      toast({
        title: "Limit Reached",
        description: `Your ${tier} plan allows up to ${features.maxBirthdays} birthdays. Upgrade for more!`,
        variant: "destructive",
      })
      return
    }

    try {
      // Filter out duplicates based on name (case insensitive)
      const existingNames = new Set(people.map((p) => p.name.toLowerCase()))
      const newPeople = importedPeople.filter((p) => !existingNames.has(p.name.toLowerCase()))

      if (user) {
        // Add each birthday to the database
        const addedPeople = await Promise.all(newPeople.map((person) => birthdayService.addBirthday(person, user.id)))
        setPeople([...people, ...addedPeople])
      } else {
        // Fallback to localStorage if not logged in
        const peopleWithIds = newPeople.map((person) => ({
          ...person,
          id: person.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
        }))
        const updatedPeople = [...people, ...peopleWithIds]
        setPeople(updatedPeople)
        localStorage.setItem("birthdayPeople", JSON.stringify(updatedPeople))
      }

      setShowImportModal(false)
      toast({
        title: "Import Successful",
        description: `${newPeople.length} birthdays have been imported.`,
      })
    } catch (error) {
      console.error("Error importing birthdays:", error)
      toast({
        title: "Error",
        description: "Failed to import birthdays. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredPeople = people.filter((person) => person.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Sort all birthdays by upcoming date
  const sortedByUpcoming = [...filteredPeople].sort((a, b) => {
    const daysUntilA = getDaysUntilBirthday(a.birthdate)
    const daysUntilB = getDaysUntilBirthday(b.birthdate)
    return daysUntilA - daysUntilB
  })

  // Find today's birthdays using the time zone aware function
  const todaysBirthdays = people.filter((person) => isBirthdayToday(person.birthdate))

  // Find upcoming birthdays (excluding today's birthdays)
  const upcomingBirthdays = sortedByUpcoming.filter((person) => !isBirthdayToday(person.birthdate))

  // Separate birthdays in current month and future months
  const today = new Date()
  const currentMonthBirthdays = upcomingBirthdays.filter((person) => {
    const birthdate = parseISO(person.birthdate)
    const birthdayThisYear = new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate())
    const birthdayThisYearCheck = birthdayThisYear

    // If birthday this year has passed, check next year's date
    if (isBefore(birthdayThisYearCheck, today)) {
      return false
    }

    return isSameMonth(birthdayThisYearCheck, today)
  })

  const futureMonthsBirthdays = upcomingBirthdays.filter((person) => {
    const birthdate = parseISO(person.birthdate)
    const birthdayThisYear = new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate())
    const birthdayThisYearCheck = birthdayThisYear

    // If birthday this year has passed, check next year's date
    if (isBefore(birthdayThisYearCheck, today)) {
      const nextYearBirthday = addYears(birthdayThisYear, 1)
      const nextYearBirthdayCheck = nextYearBirthday
      return !isSameMonth(nextYearBirthdayCheck, today)
    }

    return !isSameMonth(birthdayThisYearCheck, today)
  })

  // Combine current month and future months, but prioritize current month
  const combinedUpcomingBirthdays = [...currentMonthBirthdays, ...futureMonthsBirthdays]

  const copyBirthdayWish = (name: string) => {
    const wishes = [
      `🎂 Happy Birthday ${name}! Wishing you all the best! 🎈`,
      `🎉 It's ${name}'s special day! Happy Birthday! 🎁`,
      `✨ Happy Birthday to the amazing ${name}! Have a fantastic day! 🎊`,
      `🎈 Sending birthday wishes to ${name}! Hope your day is as wonderful as you are! 🎂`,
      `🎁 Happy Birthday ${name}! May all your wishes come true! 🎉`,
    ]

    const randomWish = wishes[Math.floor(Math.random() * wishes.length)]
    navigator.clipboard.writeText(randomWish)

    toast({
      title: "Birthday Wish Copied!",
      description: "Paste it in your favorite messaging app.",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-festive-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse flex flex-col items-center">
            <Sparkles className="h-12 w-12 text-festive-pink mb-4" />
            <h2 className="text-xl font-semibold text-festive-purple">Loading...</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-festive-cream">
      <ConfettiBackground />

      {/* Top Navigation Bar */}
      <div className="sticky top-0 left-0 right-0 z-10 h-16 bg-white border-b border-festive-purple/20 flex justify-around items-center shadow-sm">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center justify-center w-1/4 h-full ${
            activeTab === "home" ? "text-festive-pink" : "text-gray-400"
          }`}
        >
          <Gift className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex flex-col items-center justify-center w-1/4 h-full ${
            activeTab === "calendar" ? "text-festive-pink" : "text-gray-400"
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">Calendar</span>
        </button>
        <button
          onClick={() => router.push("/pricing")}
          className={`flex flex-col items-center justify-center w-1/4 h-full ${
            activeTab === "pricing" ? "text-festive-pink" : "text-gray-400"
          }`}
        >
          <CreditCard className="h-5 w-5" />
          <span className="text-xs mt-1">Pricing</span>
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center justify-center w-1/4 h-full ${
            activeTab === "profile" ? "text-festive-pink" : "text-gray-400"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>

      <div className="pb-6">
        {activeTab === "home" && (
          <div className="max-w-md mx-auto p-4">
            <header className="mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-festive-pink" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-festive-purple to-festive-pink bg-clip-text text-transparent">
                  BIRTHDAY BLISS BUDDIES
                </h1>
                <Sparkles className="h-6 w-6 text-festive-purple" />
              </div>
              <p className="text-gray-600">Celebrate special days together!</p>
              {!user && (
                <div className="mt-4">
                  <Button
                    onClick={() => router.push("/login")}
                    className="bg-gradient-to-r from-festive-purple to-festive-pink hover:opacity-90 text-white"
                  >
                    Sign In to Save Your Data
                  </Button>
                </div>
              )}
              {user && !isSubscribed && people.length >= features.maxBirthdays * 0.8 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                  <p className="text-yellow-800">
                    You're using {people.length} of {features.maxBirthdays} birthdays in your free plan.{" "}
                    <button
                      onClick={() => router.push("/pricing")}
                      className="text-festive-purple hover:text-festive-pink underline font-medium"
                    >
                      Upgrade now
                    </button>{" "}
                    to add more birthdays.
                  </p>
                </div>
              )}
            </header>

            {todaysBirthdays.length > 0 ? <TodaysBirthday people={todaysBirthdays} onWish={copyBirthdayWish} /> : null}

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-festive-purple mb-3">
                {currentMonthBirthdays.length > 0
                  ? `Birthdays This Month (${today.toLocaleString("default", { month: "long" })})`
                  : "Upcoming Birthdays"}
              </h2>
              <UpcomingBirthdays people={combinedUpcomingBirthdays.slice(0, 5)} />
            </div>

            <Button
              onClick={() => setShowAddForm(true)}
              className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-festive-pink hover:bg-festive-pink/90 text-white"
              size="icon"
            >
              <PlusCircle className="h-6 w-6" />
            </Button>
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="max-w-md mx-auto p-4">
            <header className="mb-6 text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-festive-purple to-festive-pink bg-clip-text text-transparent">
                Birthday Calendar
              </h1>
            </header>
            <CalendarView people={people} />
          </div>
        )}

        {activeTab === "profile" && (
          <div className="max-w-md mx-auto p-4">
            <header className="mb-6 text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-festive-purple to-festive-pink bg-clip-text text-transparent">
                Settings & Profile
              </h1>
            </header>
            <ProfileView
              people={people}
              onDelete={deletePerson}
              onImport={() => setShowImportModal(true)}
              user={user}
              tier={tier}
              features={features}
            />
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-festive-purple/20 shadow-lg">
            <CardContent className="pt-6">
              <AddBirthdayForm onAdd={addPerson} onCancel={() => setShowAddForm(false)} />
            </CardContent>
          </Card>
        </div>
      )}

      <ImportDataModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} onImport={handleBulkImport} />
    </main>
  )
}
