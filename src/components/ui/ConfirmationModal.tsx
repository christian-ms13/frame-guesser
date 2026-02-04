"use client"

import { useEffect } from "react"

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className = "fixed inset-0 z-50 flex items-center justify-center">
      <div
        className = "absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick = {onCancel}
      />

      <div className = "relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-neutral-200 dark:border-neutral-700">
        <h2 className = "text-2xl font-courierprime-bold text-neutral-900 dark:text-white mb-3">
          {title}
        </h2>

        <p className = "text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
          {message}
        </p>

        <div className = "flex gap-3 justify-end">
          <button
            onClick = {onCancel}
            disabled = {isLoading}
            className = "cursor-pointer px-4 py-2 rounded-lg font-play-bold transition-all duration-150 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick = {onConfirm}
            disabled = {isLoading}
            className = {`cursor-pointer px-4 py-2 rounded-lg font-play-bold transition-all duration-150 text-white disabled:opacity-50 disabled:cursor-not-allowed ${
              isDangerous
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
