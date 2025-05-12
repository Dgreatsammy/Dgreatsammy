"use client"

import type React from "react"

import { useState, useRef } from "react"
import { CalendarIcon, Upload, X } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Person } from "@/types/person"

interface AddBirthdayFormProps {
  onAdd: (person: Person) => void
  onCancel: () => void
}

export default function AddBirthdayForm({ onAdd, onCancel }: AddBirthdayFormProps) {
  const [name, setName] = useState("")
  const [date, setDate] = useState<Date>()
  const [notes, setNotes] = useState("")
  const [showAge, setShowAge] = useState(true)
  const [profilePic, setProfilePic] = useState<string>("")
  const [errors, setErrors] = useState({ name: "", date: "" })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors = {
      name: name.trim() ? "" : "Name is required",
      date: date ? "" : "Birthdate is required",
    }

    setErrors(newErrors)

    if (newErrors.name || newErrors.date) {
      return
    }

    onAdd({
      id: "",
      name: name.trim(),
      birthdate: date!.toISOString(),
      notes: notes.trim(),
      showAge,
      profilePic,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setProfilePic(event.target.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const removeProfilePic = () => {
    setProfilePic("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    if (date) {
      const newDate = new Date(date)
      newDate.setFullYear(Number.parseInt(year))
      setDate(newDate)
    } else {
      const newDate = new Date()
      newDate.setFullYear(Number.parseInt(year))
      setDate(newDate)
    }
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate && selectedYear) {
      // Preserve the selected year when choosing a date from the calendar
      newDate.setFullYear(Number.parseInt(selectedYear))
      setDate(newDate)
    } else {
      setDate(newDate)
    }
  }

  // Generate years for the dropdown (100 years back from current year)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString())

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-festive-purple mb-4">Add New Birthday</h2>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-700">
          Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter person's name"
          className="border-gray-200 focus-visible:ring-festive-purple"
        />
        {errors.name && <p className="text-festive-pink text-sm">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthdate" className="text-gray-700">
          Birthdate
        </Label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="birthdate"
                variant="outline"
                className={`flex-1 justify-start text-left font-normal border-gray-200 ${!date ? "text-muted-foreground" : ""}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "MMM d") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
            </PopoverContent>
          </Popover>

          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {errors.date && <p className="text-festive-pink text-sm">{errors.date}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700">Profile Picture (Optional)</Label>
        <div className="flex items-center gap-4">
          {profilePic ? (
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-festive-pink">
              <img src={profilePic || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeProfilePic}
                className="absolute top-0 right-0 bg-festive-pink text-white rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-full bg-festive-cream flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="border-gray-200 text-gray-500"
          >
            {profilePic ? "Change Picture" : "Upload Picture"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-gray-700">
          Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add gift ideas or other notes"
          className="border-gray-200 focus-visible:ring-festive-purple"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="show-age" className="text-gray-700">
            Show Age
          </Label>
          <p className="text-xs text-gray-500">Display age in birthday reminders</p>
        </div>
        <Switch id="show-age" checked={showAge} onCheckedChange={setShowAge} />
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-festive-purple to-festive-pink hover:opacity-90 text-white"
        >
          Save Birthday
        </Button>
      </div>
    </form>
  )
}
