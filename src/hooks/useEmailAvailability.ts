"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { checkEmailAvailability } from "../utils/supabase/actions"

type EmailStatus = "idle" | "checking" | "available" | "taken" | "invalid"
type EmailError = "too_short" | "too_long" | "invalid_format" | "taken" | null

interface EmailValidation {
  status: EmailStatus
  error: EmailError
}

export const EMAIL_REGEX = /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/

function isValidEmailFormat(email: string): EmailError {
  if (email.length < 3) {
    return "too_short"
  }
  if (email.length > 254) {
    return "too_long"
  }
  if (!EMAIL_REGEX.test(email)) {
    return "invalid_format"
  }
  return null
}

export function useEmailAvailability() {
  const [validation, setValidation] = useState<EmailValidation>({ status: "idle", error: null })
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const checkEmail = useCallback(async (email: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (!email) {
      setValidation({ status: "idle", error: null })
      return
    }

    const formatError = isValidEmailFormat(email)
    if (formatError) {
      setValidation({ status: "invalid", error: formatError })
      return
    }

    setValidation({ status: "checking", error: null })
    debounceTimerRef.current = setTimeout(async () => {
      const isAvailable = await checkEmailAvailability(email)
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

  return { status: validation.status, error: validation.error, checkEmail }
}
