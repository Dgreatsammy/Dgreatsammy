"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight, Cake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Person } from "@/types/person"
import { getAgeText } from "@/utils/date-utils"

interface CalendarViewProps {
  people: Person[]
}

export default function CalendarView({ people }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
    setSelectedDate(null)
  }

  const getBirthdaysOnDate = (date: Date) => {
    return people.filter((person) => {
      const birthdate = parseISO(person.birthdate)
      return birthdate.getDate() === date.getDate() && birthdate.getMonth() === date.getMonth()
    })
  }

  const selectedDateBirthdays = selectedDate ? getBirthdaysOnDate(selectedDate) : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={prevMonth} className="text-gray-500">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold text-festive-purple">{format(currentMonth, "MMMM yyyy")}</h2>
        <Button variant="ghost" onClick={nextMonth} className="text-gray-500">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
          <div key={`empty-start-${index}`} className="h-12 rounded-lg"></div>
        ))}

        {monthDays.map((day) => {
          const birthdaysOnDay = getBirthdaysOnDate(day)
          const hasBirthday = birthdaysOnDay.length > 0
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isToday = isSameDay(day, new Date())

          return (
            <button
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`h-12 rounded-lg flex flex-col items-center justify-center relative ${
                isSelected
                  ? "bg-gradient-to-r from-festive-purple to-festive-pink text-white"
                  : hasBirthday
                    ? "bg-festive-purple/10 text-festive-purple"
                    : isToday
                      ? "bg-festive-cream text-gray-700 border border-festive-pink"
                      : "bg-white text-gray-700 hover:bg-festive-cream"
              }`}
            >
              <span className="text-sm">{format(day, "d")}</span>
              {hasBirthday && (
                <Cake className={`h-3 w-3 absolute bottom-1 ${isSelected ? "text-white" : "text-festive-pink"}`} />
              )}
            </button>
          )
        })}

        {Array.from({ length: 6 * 7 - monthDays.length - monthStart.getDay() }).map((_, index) => (
          <div key={`empty-end-${index}`} className="h-12 rounded-lg"></div>
        ))}
      </div>

      {selectedDate && selectedDateBirthdays.length > 0 && (
        <Card className="mt-6 border-festive-purple/20">
          <CardContent className="p-4">
            <h3 className="font-medium text-festive-purple mb-3">Birthdays on {format(selectedDate, "MMMM d")}</h3>
            <div className="space-y-2">
              {selectedDateBirthdays.map((person) => (
                <div key={person.id} className="flex items-center gap-2 p-2 bg-festive-cream rounded-md">
                  <Cake className="h-4 w-4 text-festive-pink" />
                  <span>{person.name}</span>
                  {person.showAge && <span className="text-sm text-gray-500 ml-2">{getAgeText(person.birthdate)}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
