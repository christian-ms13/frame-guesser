"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { checkEmailAvailability } from "../utils/supabase/actions"

type EmailStatus = "idle" | "checking" | "available" | "taken" | "invalid"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmailFormat(email: string): boolean {
  if (email.length < 3 || email.length > 254) {
    return false
  }
  return EMAIL_REGEX.test(email)
}

export function useEmailAvailability() {
  const [status, setStatus] = useState<EmailStatus>("idle")
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const checkEmail = useCallback(async (email: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (!email) {
      setStatus("idle")
      return
    }

    if (!isValidEmailFormat(email)) {
      setStatus("invalid")
      return
    }

    setStatus("checking")
    debounceTimerRef.current = setTimeout(async () => {
      const isAvailable = await checkEmailAvailability(email)
      setStatus(isAvailable ? "available" : "taken")
    }, 500)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return { status, checkEmail }
}
