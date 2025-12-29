"use server"

import { createClient } from "./server"

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  if (username.length < 3) {
    return false
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle()

  if (error) {
    console.error("Error checking username:", error)
    return false
  }

  return data === null
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  if (email.length < 5 || !email.includes("@")) {
    return false
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (error) {
    console.error("Error checking email:", error)
    return false
  }

  return data === null
}
