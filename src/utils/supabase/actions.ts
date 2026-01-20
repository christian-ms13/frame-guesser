"use server"

import { createClient } from "./server"
import { Database } from "../../types/supabase"

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

export async function checkUsernameAvailabilityForUpdate(
  username: string,
  currentUserId: string
): Promise<boolean> {
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
    .neq("id", currentUserId)
    .maybeSingle()

  if (error) {
    console.error("Error checking username:", error)
    return false
  }

  return data === null
}

export async function checkEmailAvailabilityForUpdate(
  email: string,
  currentUserId: string
): Promise<boolean> {
  if (email.length < 3 || email.length > 254 || !email.includes("@")) {
    return false
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .neq("id", currentUserId)
    .maybeSingle()

  if (error) {
    console.error("Error checking email:", error)
    return false
  }

  return data === null
}

export async function updateUserProfile(
  userId: string,
  updateData: Database['public']['Tables']['profiles']['Update']
): Promise<{ success: boolean; data?: Database['public']['Tables']['profiles']['Row']; error?: string }> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name: updateData.display_name,
      username: updateData.username,
      email: updateData.email,
      avatar_url: updateData.avatar_url,
    })
    .eq("id", userId)
    .select("*")
    .single()

  if (error) {
    console.error("Error updating profile:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function deleteUser(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.error("Error getting current user:", userError)
    return { success: false, error: "Not authenticated" }
  }

  // Delete user profile (will cascade delete related data due to RLS policies)
  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", user.id)

  if (profileError) {
    console.error("Error deleting profile:", profileError)
    return { success: false, error: profileError.message }
  }

  // Sign out the user
  const { error: signOutError } = await supabase.auth.signOut()

  if (signOutError) {
    console.error("Error signing out:", signOutError)
    return { success: false, error: signOutError.message }
  }

  return { success: true }
}
