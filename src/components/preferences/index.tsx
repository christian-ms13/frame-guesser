"use client"

import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import React, { useState, useEffect, useCallback } from "react"

import { useClickOutside } from "../../hooks/useClickOutside"

import { IconDark, IconLight, IconSystemSettings, IconRoutine } from "./ThemeIcons"
import { IconUS, IconES } from "./LanguageIcons"

type PreferencesIndexProps = {
  className?: string
}

type ThemeMode = "light" | "dark" | "system" | "routine"

type IconComponent = React.ComponentType<{ className?: string }>

export default function PreferencesIndex({ className }: PreferencesIndexProps) {
  const pathname = usePathname()
  const router = useRouter()

  const { setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [mode, setMode] = useState<ThemeMode>("system")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const dropdownRef = useClickOutside(() => setIsDropdownOpen(false))

  const applyThemeLogic = useCallback((selectedMode: ThemeMode) => {
    localStorage.setItem("frameguesser-theme-mode", selectedMode)
    setMode(selectedMode)

    if (selectedMode === "light") setTheme("light")
      if (selectedMode === "dark") setTheme("dark")
    if (selectedMode === "system") setTheme("system")

    if (selectedMode === "routine") {
      const hour = new Date().getHours()
      const isDayTime = hour >= 7 && hour < 19
      setTheme(isDayTime ? "light" : "dark")
    }
  }, [setTheme])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true)

      const savedMode = localStorage.getItem("frameguesser-theme-mode") as ThemeMode

      if (savedMode) {
        applyThemeLogic(savedMode)
      }
    }, 0)

    return () => clearTimeout(timeout)
  }, [applyThemeLogic])

  useEffect (() => {
    if (mode !== "routine") return

    const interval = setInterval(() => {
      applyThemeLogic("routine")
    }, 60000)

    return () => clearInterval(interval)
  }, [mode, applyThemeLogic])

  const options: { id: ThemeMode; label: string; Icon: IconComponent }[] = [
    { id: "light", label: "Light", Icon: IconLight },
    { id: "dark", label: "Dark", Icon: IconDark },
    { id: "system", label: "System", Icon: IconSystemSettings },
    { id: "routine", label: "Routine", Icon: IconRoutine }
  ]

  const ActiveIcon = options.find(opt => opt.id === mode)?.Icon || IconSystemSettings

  const handleLanguageChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`

    let newPath

    if (pathname.startsWith("/en") || pathname.startsWith("/es")) {
      newPath = pathname.replace(/^\/(en|es)/, `/${newLocale}`)
    } else {
      newPath = `/${newLocale}${pathname}`
    }

    router.push(newPath)
  }

  if (!mounted) return null

  return (
    <div ref = {dropdownRef} className = {`flex gap-5 justify-between items-center ${className}`}>
      {isDropdownOpen && (
        <div className = "absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-xl p-2 shadow-xl flex flex-col gap-1 w-40 z-50 animate-in fade-in zoom-in-95 duration-200">
          {options.filter((option) => option.id !== mode).map((option) => (
            <button
              key = {option.id}
              onClick = {() => {
                applyThemeLogic(option.id)
                setIsDropdownOpen(false)
              }}
              className = "flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white text-sm cursor-pointer"
            >
              <option.Icon className = "w-5 h-5" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className = "flex gap-3">
        <button
          onClick = {() => setIsDropdownOpen(!isDropdownOpen)}
          className = "hover:bg-gray-800 p-1 rounded-full transition-colors"
        >
          <ActiveIcon className = "w-6 h-6 cursor-pointer" />
        </button>
      </div>

      <span>|</span>

      <div className = "flex gap-3">
        <button onClick = {() => handleLanguageChange("en")}>
          <IconUS className = "w-8 h-8 cursor-pointer" />
        </button>

        <button onClick = {() => handleLanguageChange("es")}>
          <IconES className = "w-8 h-8 cursor-pointer" />
        </button>
      </div>
    </div>
  )
}
