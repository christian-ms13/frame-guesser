"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { checkEmailAvailability } from "../utils/supabase/actions"

type EmailStatus = "idle" | "checking" | "available" | "taken"

export function useEmailAvailability() {
  const [status, setStatus] = useState<EmailStatus>("idle")
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const checkEmail = useCallback(async (email: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (email.length < 5 || !email.includes("@")) {
      setStatus("idle")
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
