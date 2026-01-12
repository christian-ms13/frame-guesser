"use client"

import Image from "next/image"
import { useEffect, useState, type ChangeEvent } from "react"

import { Database } from "../../types/supabase"
import GetCurrentTheme from "../../utils/GetCurrentTheme"
import { createClient } from "../../utils/supabase/client"
import { checkEmailAvailabilityForUpdate, checkUsernameAvailabilityForUpdate, updateUserProfile } from "../../utils/supabase/actions"
import { IconCheckmark, IconEmail, IconEmailUnavailable, IconLoading, IconUnavailableUsername, IconUsername } from "../login-page/InputIcons"
import { IconCamera, IconDisplayName, IconEdit, IconTrash } from "./FieldIcons"

type UserProfile = Database['public']['Tables']['profiles']['Row']

interface UserSettingsProps {
  currentUserProfile: UserProfile
  translations: (key: string) => string
  setAreSettingsClosed: (closed: boolean) => void
  onProfileUpdate: (profile: UserProfile) => void
}

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid"
type EmailStatus = "idle" | "checking" | "available" | "taken" | "invalid"

const labelClassName = "flex gap-2 items-center w-full px-4 py-2 border bg-neutral-100 ring-neutral-200 ring-1 border-none hover:bg-neutral-200 rounded-xl transition-colors duration-150 font-robotoslab-medium text-black placeholder:font-robotoslab-bold group dark:bg-neutral-700 dark:ring-neutral-600 dark:hover:bg-neutral-600 dark:text-white"
const inputClassName = "w-full focus:outline-none flex-1 bg-transparent"

export default function UserSettings({
  currentUserProfile,
  translations,
  setAreSettingsClosed,
  onProfileUpdate
}: UserSettingsProps) {
  const [displayName, setDisplayName] = useState(currentUserProfile.display_name || "")
  const [username, setUsername] = useState(currentUserProfile.username)
  const [email, setEmail] = useState(currentUserProfile.email || "")
  const currentTheme = GetCurrentTheme()
  const defaultAvatar = currentTheme === "light" ? "/user/default-pfp-light.webp" : "/user/default-pfp-dark.webp"
  const [avatarPreview, setAvatarPreview] = useState(currentUserProfile.avatar_url || defaultAvatar)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle")
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle")
  const [usernameCharCount, setUsernameCharCount] = useState(currentUserProfile.username.length)
  const [displayNameCharCount, setDisplayNameCharCount] = useState((currentUserProfile.display_name || "").length)
  
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    setDisplayNameCharCount(displayName.length)
  }, [displayName])

  useEffect(() => {
    if (avatarFile) {
      return
    }

    if (shouldRemoveAvatar) {
      setAvatarPreview(defaultAvatar)
      return
    }

    if (currentUserProfile.avatar_url) {
      setAvatarPreview(currentUserProfile.avatar_url)
    } else {
      setAvatarPreview(defaultAvatar)
    }
  }, [currentUserProfile.avatar_url, defaultAvatar, avatarFile, shouldRemoveAvatar])

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  useEffect(() => {
    setUsernameCharCount(username.length)
    
    if (username === currentUserProfile.username) {
      setUsernameStatus("idle")
      return
    }

    if (username.length < 3) {
      setUsernameStatus("invalid")
      return
    }

    if (!/^[A-Za-z0-9_]+$/.test(username) || username.includes(" ")) {
      setUsernameStatus("invalid")
      return
    }

    setUsernameStatus("checking")

    const checkUsername = async () => {
      const available = await checkUsernameAvailabilityForUpdate(username, currentUserProfile.id)
      setUsernameStatus(available ? "available" : "taken")
    }

    const timeout = setTimeout(checkUsername, 300)
    return () => clearTimeout(timeout)
  }, [username, currentUserProfile.username, currentUserProfile.id])

  useEffect(() => {
    if (email === currentUserProfile.email) {
      setEmailStatus("idle")
      return
    }

    if (email.length < 3 || email.length > 254 || !email.includes("@")) {
      setEmailStatus("invalid")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailStatus("invalid")
      return
    }

    setEmailStatus("checking")

    const checkEmail = async () => {
      const available = await checkEmailAvailabilityForUpdate(email, currentUserProfile.id)
      setEmailStatus(available ? "available" : "taken")
    }

    const timeout = setTimeout(checkEmail, 300)
    return () => clearTimeout(timeout)
  }, [email, currentUserProfile.email, currentUserProfile.id])

  const getAvatarPath = (url: string | null) => {
    if (!url) return null
    const marker = "/storage/v1/object/public/avatars/"
    const index = url.indexOf(marker)
    if (index === -1) return null
    return url.slice(index + marker.length)
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null)
    const file = event.target.files?.[0]
    if (!file) return

    const validTypes = ["image/png", "image/jpeg", "image/webp"]
    if (!validTypes.includes(file.type)) {
      setAvatarError(translations("avatarInvalidType"))
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError(translations("avatarTooLarge"))
      return
    }

    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview)
    }

    setAvatarFile(file)
    setShouldRemoveAvatar(false)
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
  }

  const handleAvatarRemove = () => {
    setAvatarError(null)

    if (shouldRemoveAvatar) {
      if (currentUserProfile.avatar_url) {
        setAvatarPreview(currentUserProfile.avatar_url)
      } else {
        setAvatarPreview(defaultAvatar)
      }
      setShouldRemoveAvatar(false)
      return
    }

    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview)
    }

    setAvatarFile(null)
    setShouldRemoveAvatar(true)
    setAvatarPreview(defaultAvatar)
  }

  const getUsernameStatusIcon = () => {
    switch (usernameStatus) {
      case "checking":
        return <IconLoading className = "w-5 h-5 text-neutral-300 animate-[spin_1s_linear_infinite_reverse]" />
      case "available":
        return <IconCheckmark className = "w-5 h-5 text-green-500" />
      case "taken":
        return <IconUnavailableUsername className = "w-5 h-5 text-red-500" />
      case "invalid":
        return <IconUnavailableUsername className = "w-5 h-5 text-red-500" />
      case "idle":
      default:
        return <IconCheckmark className = "w-5 h-5 text-neutral-300" />
    }
  }

  const getEmailStatusIcon = () => {
    switch (emailStatus) {
      case "checking":
        return <IconLoading className = "w-5 h-5 text-neutral-300 animate-[spin_1s_linear_infinite_reverse]" />
      case "available":
        return <IconCheckmark className = "w-5 h-5 text-green-500" />
      case "taken":
        return <IconEmailUnavailable className = "w-5 h-5 text-red-500" />
      case "invalid":
        return <IconEmailUnavailable className = "w-5 h-5 text-red-500" />
      case "idle":
      default:
        return <IconCheckmark className = "w-5 h-5 text-neutral-300" />
    }
  }

  const handleSave = async () => {
    setError(null)
    setSuccessMessage(null)
    setAvatarError(null)

    if (usernameStatus !== "idle" && usernameStatus !== "available") {
      setError(translations("errorMessage"))
      return
    }

    if (emailStatus !== "idle" && emailStatus !== "available") {
      setError(translations("errorMessage"))
      return
    }

    setIsSaving(true)

    try {
      const supabase = createClient()
      let newAvatarUrl = currentUserProfile.avatar_url
      const existingAvatarPath = getAvatarPath(currentUserProfile.avatar_url)

      if (avatarFile) {
        const extension = avatarFile.name.split(".").pop() || "png"
        const filePath = `${currentUserProfile.id}/${crypto.randomUUID()}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { cacheControl: "3600", upsert: false })

        if (uploadError) {
          setError(translations("avatarUploadFailed"))
          return
        }

        const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
        newAvatarUrl = publicUrlData.publicUrl

        if (existingAvatarPath) {
          const { error: removePreviousError } = await supabase.storage.from("avatars").remove([existingAvatarPath])
          if (removePreviousError) {
            setError(translations("avatarRemoveFailed"))
            return
          }
        }
      }

      if (shouldRemoveAvatar && !avatarFile) {
        if (existingAvatarPath) {
          const { error: removeError } = await supabase.storage.from("avatars").remove([existingAvatarPath])
          if (removeError) {
            setError(translations("avatarRemoveFailed"))
            return
          }
        }
        newAvatarUrl = null
      }

      const updateData: {
        display_name?: string | null
        username?: string
        email?: string
        avatar_url?: string | null
      } = {}

      if (displayName !== currentUserProfile.display_name) {
        updateData.display_name = displayName || null
      }

      if (username !== currentUserProfile.username) {
        updateData.username = username
      }

      if (email !== currentUserProfile.email) {
        updateData.email = email
      }

      if (newAvatarUrl !== currentUserProfile.avatar_url || (shouldRemoveAvatar && !avatarFile)) {
        updateData.avatar_url = newAvatarUrl
      }

      const hasChanges = Object.keys(updateData).length > 0
      if (!hasChanges) {
        setAreSettingsClosed(true)
        return
      }

      const result = await updateUserProfile(currentUserProfile.id, updateData)

      if (result.success) {
        const updatedProfile = result.data || {
          ...currentUserProfile,
          display_name: displayName || null,
          username,
          email,
          avatar_url: newAvatarUrl
        }

        onProfileUpdate(updatedProfile)
        setSuccessMessage(translations("successMessage"))
        setShouldRemoveAvatar(false)
        setAvatarFile(null)
        setAreSettingsClosed(true)
      } else {
        setError(result.error || "Failed to update profile")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const usernameAvailabilityAndCharacterCounter = (
    <div className = "flex flex-none gap-2 items-center">
      {getUsernameStatusIcon()}
      <span className = "text-neutral-600 dark:text-neutral-300">{usernameCharCount}/20</span>
    </div>
  )

  const emailAvailabilityIndicator = (
    <div className = "flex flex-none items-center">
      {getEmailStatusIcon()}
    </div>
  )

  const displayNameCharacterCounter = (
    <div className = "flex flex-none items-center text-neutral-600 dark:text-neutral-300">
      <span>{displayNameCharCount}/100</span>
    </div>
  )

  return (
    <div className = "min-h-[70vh] w-full flex items-center justify-center px-6">
      <div className = "w-full max-w-3xl bg-neutral-100 dark:bg-neutral-800 rounded-4xl shadow-xl shadow-black/40 dark:shadow-black/70 border-2 border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className = "p-8 bg-linear-to-b from-neutral-50 to-neutral-100 dark:from-neutral-700 dark:to-neutral-800">
          <h2 className = "text-3xl font-courierprime-bold text-neutral-900 dark:text-white">
            {translations("title")}
          </h2>
          <p className = "text-sm text-neutral-600 dark:text-neutral-300 mt-2">
            {translations("subtitle")}
          </p>
        </div>

        <div className = "p-8 flex flex-col gap-6">
          {error && (
            <div className = "px-4 py-3 rounded-2xl bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-100 font-robotoslab-medium">
              {error}
            </div>
          )}

          {successMessage && (
            <div className = "px-4 py-3 rounded-2xl bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-100 font-robotoslab-medium">
              {successMessage}
            </div>
          )}

          <form
            className = "flex flex-col gap-4 w-full"
            noValidate
            onSubmit = {(e) => {
              e.preventDefault()
              const isSubmitDisabled =
                isSaving ||
                (usernameStatus !== "idle" && usernameStatus !== "available") ||
                (emailStatus !== "idle" && emailStatus !== "available")
              if (isSubmitDisabled) return
              handleSave()
            }}
          >
            <div className = "flex flex-col gap-3">
              <p className = "text-sm font-courierprime-bold text-neutral-800 dark:text-neutral-100">
                {translations("avatarTitle")}
              </p>

              <div className = "flex flex-wrap items-center gap-4">
                <div className = "relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-neutral-600 shadow-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                  <Image
                    src = {avatarPreview}
                    alt = {translations("avatarTitle")}
                    fill
                    sizes = "112px"
                    className = "object-cover"
                  />
                </div>

                <div className = "flex flex-wrap items-center gap-3">
                  <label className = "cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-400 hover:bg-blue-500 text-white font-robotoslab-bold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60">
                    <input
                      type = "file"
                      accept = "image/png,image/jpeg,image/webp"
                      className = "hidden"
                      onChange = {handleAvatarChange}
                      disabled = {isSaving}
                    />
                    <IconCamera className = "w-5 h-5" />
                    <span>{translations("avatarUpload")}</span>
                  </label>

                  <button
                    type = "button"
                    onClick = {handleAvatarRemove}
                    disabled = {isSaving || (!currentUserProfile.avatar_url && !avatarFile && !shouldRemoveAvatar)}
                    className = "cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 font-robotoslab-bold"
                  >
                    <IconTrash className = "w-5 h-5" />
                    <span>{translations("avatarRemove")}</span>
                  </button>
                </div>
              </div>

              <p className = "text-xs text-neutral-600 dark:text-neutral-300 font-corporatespro-medium">
                {translations("avatarHint")}
              </p>

              {avatarError && (
                <p className = "text-xs text-red-600 dark:text-red-400 font-corporatespro-medium">{avatarError}</p>
              )}
            </div>

            <label className = {labelClassName}>
              <IconDisplayName className = "w-5 h-5" />
              <input
                type = "text"
                value = {displayName}
                onChange = {(e) => setDisplayName(e.target.value)}
                placeholder = {translations("displayNamePlaceholder")}
                disabled = {isSaving}
                maxLength = {100}
                className = {inputClassName}
              />
              {displayNameCharacterCounter}
            </label>

            <label className = {labelClassName}>
              <IconUsername className = "w-5 h-5" />
              <input
                type = "text"
                value = {username}
                onChange = {(e) => setUsername(e.target.value)}
                placeholder = {translations("usernamePlaceholder")}
                disabled = {isSaving}
                minLength = {3}
                maxLength = {20}
                pattern = "^[A-Za-z0-9_]+$"
                className = {inputClassName}
              />
              {usernameAvailabilityAndCharacterCounter}
            </label>

            {username !== currentUserProfile.username && usernameStatus === "invalid" && (
              <p className = "text-xs text-red-600 dark:text-red-400 font-corporatespro-medium -mt-2 px-2">
                {translations("usernameInvalid")}
              </p>
            )}
            {username !== currentUserProfile.username && usernameStatus === "taken" && (
              <p className = "text-xs text-red-600 dark:text-red-400 font-corporatespro-medium -mt-2 px-2">
                {translations("usernameTaken")}
              </p>
            )}

            <label className = {labelClassName}>
              <IconEmail className = "w-5 h-5" />
              <input
                type = "email"
                value = {email}
                onChange = {(e) => setEmail(e.target.value)}
                placeholder = {translations("emailPlaceholder")}
                disabled = {isSaving}
                minLength = {3}
                maxLength = {254}
                className = {inputClassName}
              />
              {emailAvailabilityIndicator}
            </label>

            {email !== currentUserProfile.email && emailStatus === "invalid" && (
              <p className = "text-xs text-red-600 dark:text-red-400 font-corporatespro-medium -mt-2 px-2">
                {translations("emailInvalid")}
              </p>
            )}
            {email !== currentUserProfile.email && emailStatus === "taken" && (
              <p className = "text-xs text-red-600 dark:text-red-400 font-corporatespro-medium -mt-2 px-2">
                {translations("emailTaken")}
              </p>
            )}
            <div className = "w-full flex items-center justify-between gap-4 mt-4">
              <button
                type = "button"
                onClick = {() => setAreSettingsClosed(true)}
                disabled = {isSaving}
                className = "cursor-pointer flex-1 sm:flex-none px-4 py-2 rounded-xl bg-red-400 hover:bg-red-500 text-white transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 font-robotoslab-bold text-lg"
              >
                {translations("cancel")}
              </button>

              <button
                type = "submit"
                disabled = {
                  isSaving ||
                  (usernameStatus !== "idle" && usernameStatus !== "available") ||
                  (emailStatus !== "idle" && emailStatus !== "available")
                }
                className = "cursor-pointer flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-400 hover:bg-blue-500 text-white transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 font-robotoslab-bold text-lg"
              >
                {isSaving ? translations("saving") : translations("saveChanges")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
