"use client"

import { format, parseISO } from "date-fns"
import { Sparkles } from "lucide-react"
import type { Person } from "@/types/person"
import { getDaysUntilBirthday, getAgeText } from "@/utils/date-utils"

interface UpcomingBirthdaysProps {
  people: Person[]
}

export default function UpcomingBirthdays({ people }: UpcomingBirthdaysProps) {
  const getMonthColor = (month: number): string => {
    const colors = [
      "bg-red-100 text-red-600", // January
      "bg-festive-pink/10 text-festive-pink", // February
      "bg-orange-100 text-orange-600", // March
      "bg-amber-100 text-amber-600", // April
      "bg-festive-blue/10 text-festive-blue", // May
      "bg-indigo-100 text-indigo-600", // June
      "bg-festive-purple/10 text-festive-purple", // July
      "bg-fuchsia-100 text-fuchsia-600", // August
      "bg-festive-green/10 text-festive-green", // September
      "bg-teal-100 text-teal-600", // October
      "bg-cyan-100 text-cyan-600", // November
      "bg-festive-yellow/10 text-yellow-600", // December
    ]
    return colors[month]
  }

  if (people.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border border-festive-purple/20">
        <p className="text-gray-500">No upcoming birthdays found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {people.map((person) => {
        const birthdate = parseISO(person.birthdate)
        const month = birthdate.getMonth()
        const day = birthdate.getDate()
        const monthColor = getMonthColor(month)
        const monthName = format(birthdate, "MMM").toUpperCase()
        const daysUntil = getDaysUntilBirthday(person.birthdate)
        const ageText = person.showAge ? getAgeText(person.birthdate) : null

        return (
          <div
            key={person.id}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-festive-purple/20 shadow-sm relative overflow-hidden"
          >
            {/* Decorative corner */}
            {daysUntil <= 7 && daysUntil > 0 && (
              <div className="absolute -top-1 -right-1 w-8 h-8">
                <div className="absolute transform rotate-45 bg-festive-pink text-white text-[8px] font-bold py-1 px-4 -right-6 top-2">
                  SOON!
                </div>
              </div>
            )}

            <div className={`w-12 h-12 rounded-lg ${monthColor} flex flex-col items-center justify-center`}>
              <span className="text-xs font-bold">{monthName}</span>
              <span className="text-lg font-bold">{day}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">{person.name}</h3>
              <div className="flex items-center">
                {ageText && <p className="text-sm text-gray-500">{ageText}</p>}
                {daysUntil <= 3 && daysUntil > 0 && (
                  <span className="ml-2">
                    <Sparkles className="h-3 w-3 text-festive-pink inline" />
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-festive-pink">
                {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow!" : `${daysUntil} days`}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
