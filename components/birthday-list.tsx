"use client"

import { Trash2, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Person } from "@/types/person"
import { formatDate, getDaysUntilBirthday, getAgeText } from "@/utils/date-utils"

interface BirthdayListProps {
  people: Person[]
  onDelete: (id: string) => void
}

export default function BirthdayList({ people, onDelete }: BirthdayListProps) {
  if (people.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-[#e5e5e5]">
        <Gift className="mx-auto h-12 w-12 text-festive-pink mb-4" />
        <h3 className="text-xl font-medium text-gray-800 mb-2">No birthdays found</h3>
        <p className="text-gray-500">Add some birthdays to start tracking!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {people.map((person) => {
        const daysUntil = getDaysUntilBirthday(person.birthdate)
        const ageText = person.showAge ? getAgeText(person.birthdate) : null

        return (
          <div
            key={person.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-lg border border-festive-purple/20 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex-1 mb-3 sm:mb-0">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-festive-cream flex items-center justify-center">
                  <span className="text-festive-purple font-semibold">{person.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{person.name}</h3>
                  <p className="text-sm text-gray-500">{formatDate(person.birthdate, "MMMM d, yyyy")}</p>
                  {person.notes && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{person.notes}</p>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-festive-pink">
                  {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow!" : `${daysUntil} days`}
                </div>
                {ageText && <div className="text-xs text-gray-500">{ageText}</div>}
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
          </div>
        )
      })}
    </div>
  )
}
