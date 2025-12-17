"use client"

import { usePathname, useRouter } from "next/navigation"

import { IconDark, IconLight } from "./ThemeIcons"
import { IconUS, IconES } from "./LanguageIcons"

type PreferencesIndexProps = {
  className?: string
}

export default function PreferencesIndex({ className }: PreferencesIndexProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLanguageChange = (newLocale: string) => {
    let newPath

    if (pathname.startsWith("/en") || pathname.startsWith("/es")) {
      newPath = pathname.replace(/^\/(en|es)/, `/${newLocale}`)
    } else {
      newPath = `/${newLocale}${pathname}`
    }

    router.push(newPath)
  }

  return (
    <div className = {`flex gap-5 justify-between items-center ${className}`}>
      <div className = "flex gap-3">
        <IconDark className = "w-6 h-6 cursor-pointer" />
        <IconLight className = "w-6 h-6 cursor-pointer" />
      </div>

      <span>|</span>

      <div className = "flex gap-3">
        <button onClick = {() => handleLanguageChange("en")}>
          <IconUS className = "w-7 h-7 cursor-pointer" />
        </button>

        <button onClick = {() => handleLanguageChange("es")}>
          <IconES className = "w-7 h-7 cursor-pointer" />
        </button>
      </div>
    </div>
  )
}
