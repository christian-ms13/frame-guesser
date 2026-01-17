"use client"

import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import PreferencesIndex from "../../../../components/preferences"
import BackHomeButton from "../../../../components/ui/BackHomeButton"
import UserDetails from "../../../../components/user-page/UserDetails"
import UserSettings from "../../../../components/user-page/UserSettings"
import ProfileDropdown from "../../../../components/user/ProfileDropdown"
import { Database } from "../../../../types/supabase"
import GetCurrentTheme from "../../../../utils/GetCurrentTheme"
import { createClient } from "../../../../utils/supabase/client"

type UserProfile = Database['public']['Tables']['profiles']['Row']

interface UserPageProps {
  params: Promise<{
    username: string
    locale: string
  }>
}

export default function UserPage({ params }: UserPageProps) {
  const locale = useLocale()
  const currentTheme = GetCurrentTheme()
  const [username, setUsername] = useState<string>("")
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null)
  const [viewedUserProfile, setViewedUserProfile] = useState<UserProfile | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [pfpSrc, setPfpSrc] = useState<string | null>(null)
  const [memberSince, setMemberSince] = useState<string | null>(null)

  const userPageTranslations = useTranslations("userPage")
  const userSettingsTranslations = useTranslations("userSettings")

  const [areSettingsClosed, setAreSettingsClosed] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { username: usernameParam } = await params
      setUsername(usernameParam)

      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setCurrentUserProfile(profile)
        setIsLoggedIn(true)
      }

      const { data: viewedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', usernameParam)
        .single()
      setViewedUserProfile(viewedProfile)
    }

    loadData()
  }, [params])

  useEffect(() => {
    if (viewedUserProfile?.avatar_url) {
      setPfpSrc(viewedUserProfile.avatar_url)
    } else {
      setPfpSrc(
        currentTheme === "light"
          ? "/user/default-pfp-light.webp"
          : "/user/default-pfp-dark.webp"
      )
    }
  }, [viewedUserProfile, currentTheme])

  useEffect(() => {
    if (viewedUserProfile?.created_at) {
      const dateLocale = locale === "en" ? "en-US" : "es-ES"
      const date = new Date(viewedUserProfile.created_at)
      setMemberSince(date.toLocaleDateString(dateLocale, { month: "short", year: "numeric" }))
    }
  }, [viewedUserProfile, locale])

  const isOwner = isLoggedIn && currentUserProfile?.username === username

  return (
    <>
      <BackHomeButton />
      {isLoggedIn && <ProfileDropdown user = {currentUserProfile} />}
      <PreferencesIndex />

      {viewedUserProfile ? (
        areSettingsClosed ? (
          <UserDetails
            pfpSrc = {pfpSrc}
            viewedUserProfile = {viewedUserProfile}
            isOwner = {isOwner}
            memberSince = {memberSince}
            translations = {userPageTranslations}
            setAreSettingsClosed = {setAreSettingsClosed}
          />
        ) : (
          <UserSettings
            currentUserProfile = {currentUserProfile!}
            translations = {userSettingsTranslations}
            setAreSettingsClosed = {setAreSettingsClosed}
            onProfileUpdate = {(updatedProfile) => {
              setViewedUserProfile(updatedProfile)
              setCurrentUserProfile(updatedProfile)
            }}
          />
        )
      ) : (
        <div className = "min-h-[90vh] w-full flex items-center justify-center">
          <p>{userPageTranslations("profileNotFound")}</p>
        </div>
      )}
    </>
  )
}
