"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { checkPasswordValidation } from "../utils/supabase/actions"

type PasswordStatus = "idle" | "checking" | "valid" | "invalid"
type PasswordError = "too_short" | "no_lowercase" | "no_uppercase" | "no_number" | "has_spaces" | null

interface PasswordValidation {
  status: PasswordStatus
  error: PasswordError
}

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,}$/

function validatePasswordFormat(password: string): PasswordError {
  if (password.length < 8) {
    return "too_short"
  }
  if (!/[a-z]/.test(password)) {
    return "no_lowercase"
  }
  if (!/[A-Z]/.test(password)) {
    return "no_uppercase"
  }
  if (!/\d/.test(password)) {
    return "no_number"
  }
  if (/\s/.test(password)) {
    return "has_spaces"
  }
  return null
}

export function usePasswordValidation() {
  const [validation, setValidation] = useState<PasswordValidation>({ status: "idle", error: null })
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const validatePassword = useCallback(async (password: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    const formatError = validatePasswordFormat(password)
    if (formatError) {
      setValidation({ status: "invalid", error: formatError })
      return
    }

    setValidation({ status: "checking", error: null })
    debounceTimerRef.current = setTimeout(async () => {
      const isValid = await checkPasswordValidation(password)
      setValidation({ status: isValid ? "valid" : "invalid", error: isValid ? null : "no_uppercase" })
    }, 500)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return { status: validation.status, error: validation.error, validatePassword }
}
