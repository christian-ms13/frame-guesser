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

const setLanguageCookie = (locale: string) => {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`
}

export default function PreferencesIndex({ className }: PreferencesIndexProps) {
  const { setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [mode, setMode] = useState<ThemeMode>("system")
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false)

  const [isDropdownOpen, setIsDropdownOpen] = useState(true)

  const themeDropdownRef = useClickOutside(() => {
    setIsThemeDropdownOpen(false)
    setIsDropdownOpen(false)
  })

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

  const themeOptions: { id: ThemeMode; label: string; Icon: IconComponent }[] = [
    { id: "light", label: "Light", Icon: IconLight },
    { id: "dark", label: "Dark", Icon: IconDark },
    { id: "system", label: "System", Icon: IconSystemSettings },
    { id: "routine", label: "Routine", Icon: IconRoutine }
  ]

  const ActiveThemeIcon = themeOptions.find(opt => opt.id === mode)?.Icon || IconSystemSettings

  // ---

  const pathname = usePathname()
  const router = useRouter()

  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)

  const languageDropdownRef = useClickOutside(() => setIsLanguageDropdownOpen(false))

  const handleLanguageChange = (newLocale: string) => {
    setLanguageCookie(newLocale)

    let newPath

    if (pathname.startsWith("/en") || pathname.startsWith("/es")) {
      newPath = pathname.replace(/^\/(en|es)/, `/${newLocale}`)
    } else {
      newPath = `/${newLocale}${pathname}`
    }

    router.push(newPath)
  }

  const languageOptions = [
    { id: "en", label: "English", Icon: IconUS },
    { id: "es", label: "Español", Icon: IconES }
  ]

  const ActiveLanguageIcon = pathname.startsWith("/es") ? IconES : IconUS
  const currentLang = pathname.startsWith("/es") ? "es" : "en"

  if (!mounted) return null

  const floatingDropdownClassName = `absolute ${isDropdownOpen ? "bottom-full opacity-100" : "bottom-0 opacity-0"} mb-4 left-1/2 -translate-x-1/2 rounded-xl p-2 flex flex-col gap-1 w-40 z-50 transition-all duration-150 bg-[#cccccc] dark:bg-[#181717] ring-4 ring-black/10 shadow backdrop-blur-sm dark:ring-[#333232]/10`

  const dropdownOptionClassName = "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-120 text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-neutral-700 cursor-pointer font-medium text-sm"

  const floatingButtonClassName = "bg-[#ddddda] dark:bg-[#1b1b1b] hover:bg-[#333232d5] dark:hover:bg-[#a19f9fd5] hover:text-white dark:hover:text-black ring-1 shadow-xs ring-[#ccccc9] dark:ring-[#202020] rounded-full duration-200 transition-colors"

  return (
    <div className = {`flex gap-5 justify-center items-center ${className}`}>
      {isThemeDropdownOpen && (
        <div
          ref = {themeDropdownRef}
          className = {floatingDropdownClassName}
        >
          {themeOptions.filter((option) => option.id !== mode).map((option) => (
            <button
              key = {option.id}
              onClick = {() => {
                applyThemeLogic(option.id)
                setIsThemeDropdownOpen(false)
              }}
              className = {dropdownOptionClassName}
            >
              <option.Icon className = "w-5 h-5" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className = "flex gap-3">
        <button
          onClick = {() => {
            if (!isThemeDropdownOpen) {
              setIsDropdownOpen(false)
              setTimeout(() => setIsDropdownOpen(true), 10)
            }
            setIsThemeDropdownOpen(!isThemeDropdownOpen)
          }}
          className = {`${floatingButtonClassName} p-1`}
        >
          <ActiveThemeIcon className = "w-6 h-6 cursor-pointer" />
        </button>
      </div>

      <span>|</span>

      {isLanguageDropdownOpen && (
        <div
          ref = {languageDropdownRef}
          className = {floatingDropdownClassName}
        >
          {languageOptions.filter((option) => option.id !== currentLang).map((option) => (
            <button
              key = {option.id}
              onClick = {() => {
                handleLanguageChange(option.id)
                setIsLanguageDropdownOpen(false)
              }}
              className = {dropdownOptionClassName}
            >
              <option.Icon className = "w-6 h-6" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className = "flex gap-3">
        <button
          onClick = {() => {
            if (!isLanguageDropdownOpen) {
              setIsDropdownOpen(false)
              setTimeout(() => setIsDropdownOpen(true), 10)
            }
            setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
          }}
          className = {`${floatingButtonClassName} p-.5`}
        >
          <ActiveLanguageIcon className = "w-8 h-8 cursor-pointer" />
        </button>
      </div>
    </div>
  )
}
