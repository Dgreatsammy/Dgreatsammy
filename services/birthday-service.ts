import { supabase } from "@/lib/supabase"
import type { Person } from "@/types/person"
import type { Database } from "@/types/supabase"

type BirthdayRow = Database["public"]["Tables"]["birthdays"]["Row"]

// Convert database row to Person type
const mapRowToPerson = (row: BirthdayRow): Person => ({
  id: row.id,
  name: row.name,
  birthdate: row.birthdate,
  notes: row.notes,
  showAge: row.show_age,
  profilePic: row.profile_pic_url || undefined,
})

// Convert Person type to database insert/update
const mapPersonToRow = (person: Person, userId: string) => ({
  user_id: userId,
  name: person.name,
  birthdate: person.birthdate,
  notes: person.notes,
  show_age: person.showAge,
  profile_pic_url: person.profilePic,
})

export const birthdayService = {
  // Get all birthdays for the current user
  async getBirthdays(userId: string): Promise<Person[]> {
    const { data, error } = await supabase.from("birthdays").select("*").eq("user_id", userId).order("birthdate")

    if (error) {
      console.error("Error fetching birthdays:", error)
      throw error
    }

    return data.map(mapRowToPerson)
  },

  // Add a new birthday
  async addBirthday(person: Omit<Person, "id">, userId: string): Promise<Person> {
    const { data, error } = await supabase
      .from("birthdays")
      .insert(mapPersonToRow({ ...person, id: "" }, userId))
      .select()
      .single()

    if (error) {
      console.error("Error adding birthday:", error)
      throw error
    }

    return mapRowToPerson(data)
  },

  // Update an existing birthday
  async updateBirthday(person: Person, userId: string): Promise<Person> {
    const { data, error } = await supabase
      .from("birthdays")
      .update(mapPersonToRow(person, userId))
      .eq("id", person.id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating birthday:", error)
      throw error
    }

    return mapRowToPerson(data)
  },

  // Delete a birthday
  async deleteBirthday(id: string, userId: string): Promise<void> {
    const { error } = await supabase.from("birthdays").delete().eq("id", id).eq("user_id", userId)

    if (error) {
      console.error("Error deleting birthday:", error)
      throw error
    }
  },

  // Upload profile picture
  async uploadProfilePic(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage.from("profile-pics").upload(fileName, file, { upsert: true })

    if (error) {
      console.error("Error uploading profile pic:", error)
      throw error
    }

    const { data: urlData } = supabase.storage.from("profile-pics").getPublicUrl(data.path)
    return urlData.publicUrl
  },
}
