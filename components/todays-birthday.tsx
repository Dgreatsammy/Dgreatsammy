"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import type { Person } from "@/types/person"
import { getAge } from "@/utils/date-utils"

interface TodaysBirthdayProps {
  people: Person[]
  onWish: (name: string) => void
}

export default function TodaysBirthday({ people, onWish }: TodaysBirthdayProps) {
  return (
    <Card className="mb-6 border border-festive-purple/20 bg-white overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-festive-purple to-festive-pink" />
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-festive-yellow opacity-20 rounded-full" />
      <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-festive-blue opacity-20 rounded-full" />

      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-festive-purple flex items-center">
              {people.length > 1 ? "Today's Birthdays" : "Today's Birthday"}{" "}
              <Sparkles className="h-4 w-4 ml-1 text-festive-pink" />
            </h2>
          </div>

          <div className="space-y-4">
            {people.map((person) => (
              <div
                key={person.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-festive-purple/10 last:border-0 last:pb-0"
              >
                <Avatar className="w-16 h-16 border-2 border-festive-pink">
                  {person.profilePic ? (
                    <AvatarImage src={person.profilePic || "/placeholder.svg"} alt={person.name} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-festive-purple to-festive-pink text-white text-xl">
                      {person.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-festive-purple">{person.name}</h3>
                  {person.showAge && <p className="text-sm text-gray-500">Turned {getAge(person.birthdate)} today</p>}
                  <Button
                    onClick={() => onWish(person.name)}
                    className="mt-2 bg-gradient-to-r from-festive-purple to-festive-pink hover:opacity-90 text-white"
                    size="sm"
                  >
                    Wish Happy Birthday!
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {people.length > 1 && (
            <div className="mt-4 pt-4 border-t border-festive-purple/10">
              <p className="text-center text-sm text-festive-purple font-medium">
                {people.length} people celebrating today! 🎉
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
