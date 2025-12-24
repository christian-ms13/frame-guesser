"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { loginSchema, signupSchema } from "../../lib/schemas"
import { createClient } from "../../utils/supabase/server"

type AuthResponse = {
  error?: string
  success?: boolean
}

export async function login(prevState: AuthResponse | null, formData: FormData): Promise<AuthResponse> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const validatedFields = loginSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return { error: "Invalid email or password format" }
  }

  const supabase = await createClient()
  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function signup(prevState: AuthResponse | null, formData: FormData): Promise<AuthResponse> {
  const rawData = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  }

  const validatedFields = signupSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return { error: "Please check your input data" }
  }

  const supabase = await createClient()
  const { username, email, password } = validatedFields.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/")
}
