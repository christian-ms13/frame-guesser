"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { checkPasswordValidation } from "../utils/supabase/actions"

type PasswordStatus = "idle" | "checking" | "valid" | "invalid"

export function usePasswordValidation() {
  const [status, setStatus] = useState<PasswordStatus>("idle")
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const validatePassword = useCallback(async (password: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (password.length < 8) {
      setStatus("idle")
      return
    }

    setStatus("checking")
    debounceTimerRef.current = setTimeout(async () => {
      const isValid = await checkPasswordValidation(password)
      setStatus(isValid ? "valid" : "invalid")
    }, 500)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return { status, validatePassword }
}
