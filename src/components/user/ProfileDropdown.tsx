"use client"

import { useLocale, useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import { logout } from "../../app/auth/actions"
import { useClickOutside } from "../../hooks/useClickOutside"
import { Database } from "../../types/supabase"
import GetCurrentTheme from "../../utils/GetCurrentTheme"
import { IconCalendar, IconLogout } from "./DropdownIcons"

type UserProfile = Database['public']['Tables']['profiles']['Row']

export default function ProfileDropdown({ user }: { user: UserProfile | null }) {
  useTheme()
  const locale = useLocale()
  const currentTheme = GetCurrentTheme()
  const [pfpSrc, setPfpSrc] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [memberSince, setMemberSince] = useState<string>("")
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsDropdownOpen(false))

  const translations = useTranslations("profileDropdown")

  useEffect(() => {
    if (user?.avatar_url) {
      setPfpSrc(user.avatar_url)
    } else {
      setPfpSrc(
        currentTheme === "light"
          ? "/user/default-pfp-light.webp"
          : "/user/default-pfp-dark.webp"
      )
    }
  }, [user, currentTheme])

  useEffect(() => {
    if (user?.created_at) {
      const dateLocale = locale === "es" ? "es-ES" : "en-US"
      const date = new Date(user.created_at)
      setMemberSince(date.toLocaleDateString(dateLocale, { month: "short", year: "numeric" }))
    }
  }, [user, locale])

  const handleUlToggle = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className = "absolute top-0 right-0 mr-7 mt-7 flex items-end gap-4 z-50 flex-col">
      <div
        className = {`w-12 h-12 rounded-full border-3 border-neutral-600 flex items-center justify-center p-0.5 hover:border-red-500 transition-all duration-300 cursor-pointer ${isDropdownOpen ? "border-red-500 scale-105" : ""}`}
        onClick = {handleUlToggle}
      >
        <div className = "relative w-full h-full rounded-full overflow-hidden">
          {pfpSrc && (
            <Image
              src = {pfpSrc}
              alt = "User Avatar"
              fill
              className = "object-cover"
            />
          )}
        </div>
      </div>

      <div 
        ref = {dropdownRef} 
        className = {`w-72 bg-neutral-100 dark:bg-neutral-800 rounded-4xl shadow-xl shadow-black/50 dark:shadow-black/70 overflow-hidden transition-all duration-300 ease-out border-2 border-neutral-200 dark:border-neutral-700 ${isDropdownOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}
      >
        <div className = "p-6 flex flex-col items-center gap-4 bg-linear-to-b from-neutral-50 to-neutral-100 dark:from-neutral-700 dark:to-neutral-800">
          <div className = "relative w-30 h-30 rounded-full border-4 border-white dark:border-neutral-600 shadow-lg overflow-hidden">
            {pfpSrc && (
              <Image
                src = {pfpSrc}
                alt = "User Avatar"
                fill
                className = "object-cover"
              />
            )}
          </div>

          <div className = "flex flex-col items-center gap-1 w-full">
            <Link
              href = {user ? `/${locale}/user/${user.username}` : "#"}
              className = "text-lg font-karnak-pro-bold text-neutral-900 dark:text-white px-5 flex items-center gap-1 hover:underline justify-center ring-2 rounded-full ring-neutral-300 dark:ring-neutral-600 hover:ring-neutral-500 dark:hover:ring-neutral-400 transition-color duration-400 max-w-full pb-1 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 mb-4 mt-1"
            >
              <span className = "truncate leading-none">{user?.username || "Guest"}</span>
            </Link>
            <p className = "text-sm font-robotoslab-medium text-neutral-600 dark:text-neutral-400 truncate max-w-full px-2">
              {user?.email || "Not logged in"}
            </p>
          </div>

          <div className = "w-full px-4">
            <div className = "w-full h-px bg-linear-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent" />
          </div>

          <div className = "flex items-center gap-2 text-xs font-corporatespro-medium text-neutral-500 dark:text-neutral-400 tracking-wide">
            <IconCalendar className = "w-4 h-4" />
            <span className = "uppercase">{user ? `${translations("memberSince")} ${memberSince}` : translations("guest")}</span>
          </div>
        </div>

        <div className = "p-4">
          <button
            onClick = {handleLogout}
            className = "cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-400 hover:bg-red-500 text-white font-play-bold transition-all duration-150 hover:scale-105 active:scale-100 hover:shadow-md hover:shadow-red-300"
          >
            <IconLogout className = "w-5 h-5" />
            <span>{translations("logout")}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
