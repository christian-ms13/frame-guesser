"use server"

import { createClient } from "./server"

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  if (username.length < 3) {
    return false
  }

  if (!/^[A-Za-z0-9_]+$/.test(username) || username.includes(" ")) {
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
  // Modern flexible email validation: min 3 chars (a@b), max 254 (RFC 5321)
  if (email.length < 3 || email.length > 254 || !email.includes("@")) {
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

export async function checkPasswordValidation(password: string): Promise<boolean> {
  if (/\s/.test(password)) {
    return false
  }

  if (password.length < 8) {
    return false
  }

  if (!/[a-z]/.test(password)) {
    return false
  }

  if (!/[A-Z]/.test(password)) {
    return false
  }

  if (!/\d/.test(password)) {
    return false
  }

  return true
}
