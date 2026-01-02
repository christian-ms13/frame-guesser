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
    .ilike("username", username)
    .maybeSingle()

  if (error) {
    console.error("Error checking username:", error)
    return false
  }

  return data === null
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  if (email.length < 3 || email.length > 254 || !email.includes("@")) {
    return false
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", email)
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

export async function signUpUser(
  email: string,
  password: string,
  username: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username
      }
    }
  })

  if (error) {
    console.error("Sign up error:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function signInUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error("Sign in error:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
