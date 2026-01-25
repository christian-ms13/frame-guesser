"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { logout } from "../../app/auth/actions"
import { Database } from "../../types/supabase"
import { deleteUser } from "../../utils/supabase/actions"
import { IconTrophy } from "../game/GameIcons"
import { IconPlay } from "../home-page/actions/LinkIcons"
import ConfirmationModal from "../ui/ConfirmationModal"
import Tooltip from "../ui/Tooltip"
import TruncatedTooltip from "../ui/TruncatedTooltip"
import { IconEdit, IconLogout, IconTrash } from "../user-page/FieldIcons"

type UserProfile = Database['public']['Tables']['profiles']['Row']

interface UserDetailsProps {
  pfpSrc: string | null
  viewedUserProfile: UserProfile
  isOwner: boolean
  memberSince: string | null
  translations: (key: string) => string
  setAreSettingsClosed: (closed: boolean) => void
}

export default function UserDetails({ pfpSrc, viewedUserProfile, isOwner, memberSince, translations, setAreSettingsClosed }: UserDetailsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  const handleDeleteClick = () => {
    setIsConfirmModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    const result = await deleteUser()
    
    if (result.success) {
      router.push("/")
    } else {
      setIsDeleting(false)
      setIsConfirmModalOpen(false)
      console.error("Failed to delete user:", result.error)
    }
  }

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false)
  }
  return (
    <div className = "min-h-[70vh] w-full flex items-center justify-center px-6 relative">
      {!isOwner && (
        <Link
          href = "/play"
          className = "absolute bottom-8 text-xl flex gap-2 items-center justify-center px-5 py-3 rounded-full transition-all duration-100 ease-out hover:scale-115 active:scale-100 hover:shadow-lg shadow-black/50 dark:shadow-white/20 font-play-bold bg-[#121212] text-[#e3e3e1] dark:bg-[#e3e3e1] dark:text-[#121212]"
        >
          <IconPlay className = "w-6 h-6" />
          <span>Play</span>
        </Link>
      )}

      <div className = "w-full max-w-3xl relative">
        <div className = "absolute top-5 right-5 z-10 flex flex-col gap-2">
          {isOwner && (
            <Tooltip text = {translations("tooltips.play")}>
              <div>
                <Link
                  href = "/play"
                  className = "cursor-pointer flex items-center justify-center gap-1 px-4 py-3 rounded-2xl bg-green-400 hover:bg-green-500 text-white font-play-bold transition-all duration-150 hover:scale-105 active:scale-100 hover:shadow-md hover:shadow-green-800 dark:hover:shadow-green-300"
                >
                  <IconPlay className = "w-5 h-5" />
                </Link>
              </div>
            </Tooltip>
          )}

          {isOwner && (
            <Tooltip text = {translations("tooltips.userRecords")}>
              <div>
                <Link
                  href = "/records"
                  className = "cursor-pointer flex items-center justify-center gap-1 px-4 py-3 rounded-2xl bg-blue-400 hover:bg-blue-500 text-white font-play-bold transition-all duration-150 hover:scale-105 active:scale-100 hover:shadow-md hover:shadow-blue-800 dark:hover:shadow-blue-300"
                >
                  <IconTrophy className = "w-5 h-5" />
                </Link>
              </div>
            </Tooltip>
          )}

          {isOwner && (
            <Tooltip text = {translations("tooltips.deleteUser")}>
              <div>
                <button
                  onClick = {handleDeleteClick}
                  disabled = {isDeleting}
                  className = "cursor-pointer flex items-center justify-center gap-1 px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-play-bold transition-all duration-150 hover:scale-105 active:scale-100 hover:shadow-md hover:shadow-red-900 dark:hover:shadow-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconTrash className = "w-5 h-5" />
                </button>
              </div>
            </Tooltip>
          )}
        </div>

        <div className = "bg-neutral-100 dark:bg-neutral-800 rounded-4xl shadow-xl shadow-black/40 dark:shadow-black/70 border-2 border-neutral-200 dark:border-neutral-700 overflow-hidden relative">

          <div className = "p-8 bg-linear-to-b from-neutral-50 to-neutral-100 dark:from-neutral-700 dark:to-neutral-800">
            <div className = "flex items-center gap-6 relative">
              <div className = "relative w-28 h-28 rounded-full border-4 border-white dark:border-neutral-600 shadow-lg overflow-hidden">
                {pfpSrc && (
                  <Image src = {pfpSrc} alt = "User Avatar" fill className = "object-cover" />
                )}
              </div>

              <div className = "flex-1 flex flex-col gap-2 min-w-0 pr-12">
                <TruncatedTooltip text = {viewedUserProfile.display_name || viewedUserProfile.username}>
                  <h1 className = "text-4xl font-courierprime-bold text-neutral-900 dark:text-white truncate">
                    {viewedUserProfile.display_name || viewedUserProfile.username}
                  </h1>
                </TruncatedTooltip>

                <div className = "flex items-center gap-3 flex-wrap">
                  <TruncatedTooltip text = {viewedUserProfile.username}>
                    <span className = "px-4 py-1 rounded-full text-sm font-cascadiacode-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 ring-2 ring-neutral-300 dark:ring-neutral-600 truncate">
                      @{viewedUserProfile.username}
                    </span>
                  </TruncatedTooltip>
                </div>
              </div>
            </div>
          </div>

          <div className = "p-8 flex flex-col gap-6">
            <div className = "grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className = "rounded-2xl p-5 bg-neutral-200 dark:bg-neutral-700 ring-2 ring-neutral-300 dark:ring-neutral-600">
                <p className = "text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-300 font-corporatespro-medium">
                  {translations("displayName")}
                </p>
                <p className = "text-lg font-robotoslab-bold text-neutral-900 dark:text-white truncate">
                  {viewedUserProfile.display_name || "—"}
                </p>
              </div>

              <div className = "rounded-2xl p-5 bg-neutral-200 dark:bg-neutral-700 ring-2 ring-neutral-300 dark:ring-neutral-600">
                <p className = "text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-300 font-corporatespro-medium">
                  {translations("username")}
                </p>
                <p className = "text-lg font-robotoslab-bold text-neutral-900 dark:text-white truncate">{viewedUserProfile.username}</p>
              </div>

              {isOwner && (
                <div className = "rounded-2xl p-5 bg-neutral-200 dark:bg-neutral-700 ring-2 ring-neutral-300 dark:ring-neutral-600">
                  <p className = "text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-300 font-corporatespro-medium">
                    {translations("email")}
                  </p>
                  <p className = "text-lg font-robotoslab-bold text-neutral-900 dark:text-white truncate">{viewedUserProfile.email}</p>
                </div>
              )}

              <div className = "rounded-2xl p-5 bg-neutral-200 dark:bg-neutral-700 ring-2 ring-neutral-300 dark:ring-neutral-600">
                <p className = "text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-300 font-corporatespro-medium">
                  {translations("memberSince")}
                </p>
                <p className = "text-lg uppercase font-robotoslab-bold text-neutral-900 dark:text-white truncate">{memberSince || "—"}</p>
              </div>
            </div>

            {isOwner && (
              <div className = "w-full flex items-center justify-between">
                <form action = {logout} className = "mt-2">
                  <button
                    type = "submit"
                    className = "cursor-pointer w-full sm:w-max flex items-center justify-center gap-1 px-4 py-3 rounded-2xl bg-red-400 hover:bg-red-500 text-white font-play-bold transition-all duration-150 hover:scale-105 active:scale-100 hover:shadow-md hover:shadow-red-800 dark:hover:shadow-red-300"
                  >
                    <IconLogout className = "w-5 h-5" />
                    <span>Log out</span>
                  </button>
                </form>

                <button
                  className = "cursor-pointer w-full sm:w-max flex items-center justify-center gap-1 px-4 py-3 rounded-2xl bg-blue-400 hover:bg-blue-500 text-white font-play-bold transition-all duration-150 hover:scale-105 active:scale-100 hover:shadow-md hover:shadow-blue-800 dark:hover:shadow-blue-300"
                  onClick = {() => setAreSettingsClosed(false)}
                >
                  <IconEdit className = "w-5 h-5" />
                  {translations("editProfile")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title={translations("deleteUserModal.title")}
        message={translations("deleteUserModal.message")}
        confirmText={translations("deleteUserModal.confirm")}
        cancelText={translations("deleteUserModal.cancel")}
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}
