import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Create a client for use in browser components
export const createClient = () => {
  return createClientComponentClient<Database>()
}

// For direct usage in components
export const supabase = createClientComponentClient<Database>()
