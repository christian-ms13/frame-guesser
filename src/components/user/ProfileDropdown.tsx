"use client"

import { useLocale } from "next-intl"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"

import { useClickOutside } from "../../hooks/useClickOutside"
import { Database } from "../../types/supabase"
import GetCurrentTheme from "../../utils/GetCurrentTheme"

type UserProfile = Database['public']['Tables']['profiles']['Row']

export default function ProfileDropdown({ user }: { user: UserProfile | null }) {
  useTheme()
  const locale = useLocale()
  const currentTheme = GetCurrentTheme()
  const [pfpSrc, setPfpSrc] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [memberSince, setMemberSince] = useState<string>("")
  const dropdownRef = useClickOutside<HTMLUListElement>(() => setIsDropdownOpen(false))

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
      setMemberSince(new Date(user.created_at).toLocaleDateString(dateLocale))
    }
  }, [user, locale])

  const handleUlToggle = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <div className = "absolute top-0 right-0 mr-7 mt-7 flex items-end gap-2 z-50 flex-col">
      <div className = {`w-15 h-15 rounded-full border-3 border-neutral-600 flex items-center justify-center p-0.5 hover:border-red-500 transition-colors duration-300 ${isDropdownOpen ? "border-red-500" : ""}`}>
        <div className = "relative w-full h-full rounded-full overflow-hidden">
          {pfpSrc && (
            <Image
              src = {pfpSrc}
              alt = "User Avatar"
              fill
              className = "object-cover cursor-pointer"
              onClick = {handleUlToggle}
            />
          )}
        </div>
      </div>

      <ul ref = {dropdownRef} className = {`w-max bg-neutral-800 rounded-xl shadow-lg shadow-black/50 py-2 px-4 flex flex-col gap-1 dark:bg-neutral-700 text-white ${isDropdownOpen ? "" : "hidden"}`}>
        <li className = "text-sm text-center font-medium">
          {user?.username || "Guest"}
        </li>

        <hr className = "border-neutral-600 my-1" />

        <li className = "text-xs text-center text-neutral-400">
          {user ? `Member since ${memberSince}` : "Not logged in"}
        </li>
      </ul>
    </div>
  )
}
