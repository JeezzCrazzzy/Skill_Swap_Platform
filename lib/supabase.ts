import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  name: string
  location: string
  skills_offered: string[]
  skills_wanted: string[]
  availability: string
  profile_visibility: string
  avatar_url?: string
  created_at: string
  updated_at: string
}
