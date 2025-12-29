"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { checkUsernameAvailability } from "../utils/supabase/actions"

type UsernameStatus = "idle" | "checking" | "available" | "taken"

export function useUsernameAvailability() {
  const [status, setStatus] = useState<UsernameStatus>("idle")
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const checkUsername = useCallback(async (username: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (username.length < 3) {
      setStatus("idle")
      return
    }

    debounceTimerRef.current = setTimeout(async () => {
      setStatus("checking")

      const isAvailable = await checkUsernameAvailability(username)
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

  return { status, checkUsername }
}
