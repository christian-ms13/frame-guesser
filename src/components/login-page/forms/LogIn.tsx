"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { IconEmail, IconPassword, IconShowPassword, IconHidePassword } from "../InputIcons"

const labelClassName = "flex gap-2 items-center w-full px-4 py-2 border bg-neutral-100 ring-neutral-200 ring-1 border-none hover:bg-neutral-200 rounded-xl transition-colors duration-150 font-robotoslab-medium text-black placeholder:font-robotoslab-bold group dark:bg-neutral-700 dark:ring-neutral-600 dark:hover:bg-neutral-600 dark:text-white"
const inputClassName = "w-full focus:outline-none flex-1"

export default function LoginForm() {
  const translations = useTranslations("loginForm")

  const [areAllFieldsFilled, setAreAllFieldsFilled] = useState(false)
  const [isPasswordShown, setIsPasswordShown] = useState(false)

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
      <label className = {labelClassName}>
        <IconEmail className = "w-5 h-5" />

        <input
          type = "email"
          placeholder = {translations("emailPlaceholder")}
          className = {inputClassName}
          autoComplete = "email"
          required
          minLength = {3}
          maxLength = {254}
          onChange = {handleInputChange}
          autoFocus
        />
      </label>

      <label className = {labelClassName}>
        <IconPassword className = "w-5 h-5" />

        <input
          type = {isPasswordShown ? "text" : "password"}
          placeholder = {translations("passwordPlaceholder")}
          className = {inputClassName}
          required
          onChange = {handleInputChange}
          pattern = "^\\S+$"
        />

        <button
          type = "button"
          className = "cursor-pointer flex-none"
          onClick = {() => setIsPasswordShown(!isPasswordShown)}
        >
          {isPasswordShown ? <IconHidePassword className = "w-5 h-5" /> : <IconShowPassword className = "w-5 h-5" />}
        </button>
      </label>

      <button
        type = "submit"
        className = "w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:bg-neutral-300 dark:disabled:bg-neutral-900 dark:bg-neutral-300 dark:text-black dark:disabled:text-white dark:hover:bg-neutral-100 font-robotoslab-bold text-lg"
        disabled = {!areAllFieldsFilled}
      >
        {translations("loginButton")}
      </button>
    </form>
  )
}
