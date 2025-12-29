"use client"

import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { usePathname, useRouter } from "next/navigation"
import React, { useCallback, useEffect, useState } from "react"

import { useClickOutside } from "../../hooks/useClickOutside"
import Tootltip from "../ui/Tooltip"
import { IconES, IconUS } from "./LanguageIcons"
import { IconDark, IconLight, IconRoutine, IconSystemSettings } from "./ThemeIcons"

type ThemeMode = "light" | "dark" | "system" | "routine"

type IconComponent = React.ComponentType<{ className?: string }>

const setLanguageCookie = (locale: string) => {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`
}

export default function PreferencesIndex() {
  const translations = useTranslations("homePage")

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
    { id: "light", label: translations("themeDropdown.light"), Icon: IconLight },
    { id: "dark", label: translations("themeDropdown.dark"), Icon: IconDark },
    { id: "system", label: translations("themeDropdown.system"), Icon: IconSystemSettings },
    { id: "routine", label: translations("themeDropdown.routine"), Icon: IconRoutine }
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
  const langBgClass = currentLang === "es"
    ? "bg-[url('/preferences-index/spain.png')]"
    : "bg-[url('/preferences-index/usa.png')]"

  if (!mounted) return null

  const floatingDropdownClassName = `absolute ${isDropdownOpen ? "bottom-full opacity-100" : "bottom-0 opacity-0"} mb-4 left-1/2 -translate-x-1/2 rounded-xl p-2 flex flex-col gap-1 w-40 z-50 transition-all duration-150 bg-[#cccccc] dark:bg-[#181717] ring-3 ring-black/10 shadow backdrop-blur-sm dark:ring-[#3a3838]/10`

  const dropdownOptionClassName = "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-120 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-700 cursor-pointer font-system-ui font-medium text-sm"

  const floatingButtonClassName = "bg-[#ddddda] dark:bg-[#1b1b1b] hover:bg-[#333232d5] dark:hover:bg-[#a19f9fd5] hover:text-white ring-1 shadow-xs ring-[#ccccc9] dark:ring-[#202020] rounded-full duration-200 transition-colors shadow-black dark:shadow-white"

  return (
    <div className = {`flex gap-5 justify-center items-center fixed bottom-0 w-full pb-5 z-40`}>
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
        <Tootltip text = {translations("tooltips.theme")} active = {!isThemeDropdownOpen}>
          <button
            onClick = {() => {
              if (!isThemeDropdownOpen) {
                setIsDropdownOpen(false)
                setTimeout(() => setIsDropdownOpen(true), 10)
                if (isLanguageDropdownOpen) setIsLanguageDropdownOpen(false)
              }
              setIsThemeDropdownOpen(!isThemeDropdownOpen)
            }}
            className = {`${floatingButtonClassName} group p-1`}
          >
            <ActiveThemeIcon className = "w-6 h-6 cursor-pointer transition-colors duration-150 dark:group-hover:text-black" />
          </button>
        </Tootltip>
      </div>

      <span className = "font-black">|</span>

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
        <Tootltip text = {translations("tooltips.language")} active = {!isLanguageDropdownOpen}>
          <button
            onClick = {() => {
              if (!isLanguageDropdownOpen) {
                setIsDropdownOpen(false)
                setTimeout(() => setIsDropdownOpen(true), 10)
                if (isThemeDropdownOpen) setIsThemeDropdownOpen(false)
              }
              setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
            }}
            className = {`${floatingButtonClassName} relative overflow-hidden group p-0`}
          >
            <div className = {`absolute inset-0 ${langBgClass} bg-cover bg-center opacity-0 group-hover:opacity-100 transition-opacity duration-350 z-0`} />
            <div className = "absolute inset-0 bg-black/47 opacity-0 group-hover:opacity-100 transition-opacity duration-350 z-0" />
            <ActiveLanguageIcon className = "w-8 h-8 cursor-pointer relative z-10" />
          </button>
        </Tootltip>
      </div>
    </div>
  )
}
