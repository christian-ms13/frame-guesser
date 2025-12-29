"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

const inputClassName = "w-full px-4 py-2 border bg-neutral-100 ring-neutral-200 ring-1 border-none hover:bg-neutral-200 rounded-xl transition-colors duration-150 font-robotoslab-medium focus:outline-none"

export default function LoginForm() {
  const translations = useTranslations("loginForm")

  const [areAllFieldsFilled, setAreAllFieldsFilled] = useState(false)

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const form = event.currentTarget.form
    if (!form) return
    const inputs = Array.from(form.elements).filter(element => element.tagName === "INPUT") as HTMLInputElement[]
    const allFilled = inputs.every(input => input.value.trim() !== "")
    setAreAllFieldsFilled(allFilled)
  }

  useEffect(() => {
    const timeout = setTimeout(() => setAreAllFieldsFilled(false), 0)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <form className = "flex flex-col gap-4 w-full">
      <input
        type = "email"
        placeholder = {translations("emailPlaceholder")}
        className = {inputClassName}
        autoComplete = "email"
        required
        onChange = {handleInputChange}
        autoFocus
      />

      <input
        type = "password"
        placeholder = {translations("passwordPlaceholder")}
        className = {inputClassName}
        required
        onChange = {handleInputChange}
        pattern = "^\\S+$"
      />

      <button
        type = "submit"
        className = "w-full px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-xl transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:bg-red-200"
        disabled = {!areAllFieldsFilled}
      >
        {translations("loginButton")}
      </button>
    </form>
  )
}
