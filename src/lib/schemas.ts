import { z } from 'zod'

const passwordValidation = z.string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/^\S+$/, "Password must not contain spaces")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")

export const loginSchema = z.object({
  email: z.string()
    .min(3, "Email must be at least 3 characters")
    .max(254, "Email must not exceed 254 characters")
    .email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^\S+$/, "Password must not contain spaces")
})

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .regex(/^[A-Za-z0-9_]+$/, "Only letters, numbers, and underscores are allowed"),
  email: z.string()
    .min(3, "Email must be at least 3 characters")
    .max(254, "Email must not exceed 254 characters")
    .email("Invalid email address"),
  password: passwordValidation,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})
