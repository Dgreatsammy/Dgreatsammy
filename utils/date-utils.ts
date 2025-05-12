import { parseISO, isSameDay, differenceInDays, addYears, isAfter, isBefore, format } from "date-fns"

// Get the user's time zone
export const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

// Convert a date to the user's local time (without using utcToZonedTime)
export function toLocalTime(date: Date): Date {
  return new Date(date)
}

// Check if a date is today in the user's time zone
export function isToday(date: Date): boolean {
  const today = new Date()
  return isSameDay(date, today)
}

// Get days until birthday, accounting for time zone
export function getDaysUntilBirthday(birthdate: string): number {
  const today = new Date()
  const birthdateObj = parseISO(birthdate)

  // Set birthday to this year
  const birthdayThisYear = new Date(today.getFullYear(), birthdateObj.getMonth(), birthdateObj.getDate())

  // If birthday has already occurred this year, set to next year
  if (isBefore(birthdayThisYear, today)) {
    return differenceInDays(addYears(birthdayThisYear, 1), today)
  }

  return differenceInDays(birthdayThisYear, today)
}

// Get age based on birthdate
export function getAge(birthdate: string): number {
  const today = new Date()
  const birthdateObj = parseISO(birthdate)
  let age = today.getFullYear() - birthdateObj.getFullYear()

  const birthdayThisYear = new Date(today.getFullYear(), birthdateObj.getMonth(), birthdateObj.getDate())

  // If birthday hasn't occurred yet this year, subtract 1
  if (isAfter(birthdayThisYear, today)) {
    age--
  }

  return age
}

// Get appropriate age text based on birthday status
export function getAgeText(birthdate: string): string {
  const today = new Date()
  const birthdateObj = parseISO(birthdate)
  const age = getAge(birthdate)

  const birthdayThisYear = new Date(today.getFullYear(), birthdateObj.getMonth(), birthdateObj.getDate())

  if (isSameDay(birthdayThisYear, today)) {
    return `Turned ${age} today`
  } else if (isBefore(birthdayThisYear, today)) {
    return `Turned ${age} on ${format(birthdayThisYear, "MMM d")}`
  } else {
    return `Turning ${age + 1} on ${format(birthdayThisYear, "MMM d")}`
  }
}

// Check if a birthdate is today
export function isBirthdayToday(birthdate: string): boolean {
  const today = new Date()
  const birthdateObj = parseISO(birthdate)

  const birthdayThisYear = new Date(today.getFullYear(), birthdateObj.getMonth(), birthdateObj.getDate())

  return isSameDay(birthdayThisYear, today)
}

// Format a date string for display
export function formatDate(dateString: string, formatStr = "MMMM d, yyyy"): string {
  const date = parseISO(dateString)
  return format(date, formatStr)
}
