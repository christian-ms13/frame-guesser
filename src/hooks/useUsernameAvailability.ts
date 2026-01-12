"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { checkUsernameAvailability } from "../utils/supabase/actions"

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid"
type UsernameError = "too_short" | "invalid_characters" | "taken" | null

interface UsernameValidation {
  status: UsernameStatus
  error: UsernameError
}

export function useUsernameAvailability() {
  const [validation, setValidation] = useState<UsernameValidation>({ status: "idle", error: null })
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const checkUsername = useCallback(async (username: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (username.length < 3) {
      setValidation({ status: "invalid", error: "too_short" })
      return
    }

    if (!/^[A-Za-z0-9_]+$/.test(username) || username.includes(" ")) {
      setValidation({ status: "invalid", error: "invalid_characters" })
      return
    }

    setValidation({ status: "checking", error: null })
    debounceTimerRef.current = setTimeout(async () => {
      const isAvailable = await checkUsernameAvailability(username)
      if (isAvailable) {
        setValidation({ status: "available", error: null })
      } else {
        setValidation({ status: "taken", error: "taken" })
      }
    }, 500)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return { status: validation.status, error: validation.error, checkUsername }
}
