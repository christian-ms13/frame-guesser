import { Database } from "../types/supabase"
import { createClient } from "./supabase/server"

export default async function GetCurrentUserProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  let userProfile: Database['public']['Tables']['profiles']['Row'] | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    userProfile = data
  }

  return { userProfile, isLoggedIn }
}
