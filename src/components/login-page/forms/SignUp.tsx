"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { useEmailAvailability } from "../../../hooks/useEmailAvailability"
import { useUsernameAvailability } from "../../../hooks/useUsernameAvailability"
import { IconCheckmark, IconConfirmPasswordBefore, IconEmail, IconLoading, IconPassword, IconUnavailableUsername, IconUsername } from "../InputIcons"

const labelClassName = "flex gap-2 items-center w-full px-4 py-2 border bg-neutral-100 ring-neutral-200 ring-1 border-none hover:bg-neutral-200 rounded-xl transition-colors duration-150 font-robotoslab-medium text-black placeholder:font-robotoslab-bold group"
const inputClassName = "w-full focus:outline-none flex-1"

export default function SignupForm() {
  const translations = useTranslations("signUpForm")

  const [areAllFieldsFilled, setAreAllFieldsFilled] = useState(false)
  const { status: usernameStatus, checkUsername } = useUsernameAvailability()
  const { status: emailStatus, checkEmail } = useEmailAvailability()

  const [characterCount, setCharacterCount] = useState(0)

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

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const username = event.target.value
    checkUsername(username)
  }

  const getUsernameStatusIcon = () => {
    switch (usernameStatus) {
      case "checking":
        return <IconLoading className = "w-5 h-5 text-neutral-300 animate-[spin_1s_linear_infinite_reverse]" />
      case "available":
        return <IconCheckmark className = "w-5 h-5 text-green-500" />
      case "taken":
        return <IconUnavailableUsername className = "w-5 h-5 text-red-500" />
      case "idle":
      default:
        return <IconCheckmark className = "w-5 h-5 text-neutral-300" />
    }
  }

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const email = event.target.value
    checkEmail(email)
  }

  const getEmailStatusIcon = () => {
    switch (emailStatus) {
      case "checking":
        return <IconLoading className = "w-5 h-5 text-neutral-300 animate-[spin_1s_linear_infinite_reverse]" />
      case "available":
        return <IconCheckmark className = "w-5 h-5 text-green-500" />
      case "taken":
        return <IconCheckmark className = "w-5 h-5 text-red-500" />
      case "idle":
      default:
        return <IconCheckmark className = "w-5 h-5 text-neutral-300" />
    }
  }

  const getLiveCharacterCount = (event: Event) => {
    const input = event.target as HTMLInputElement
    setCharacterCount(input.value.length)
  }

  useEffect(() => {
    const input = document.querySelector('input[type="text"]') as HTMLInputElement | null
    if (!input) return
    input.addEventListener("input", getLiveCharacterCount)

    return () => {
      input.removeEventListener("input", getLiveCharacterCount)
    }
  }, [])

  const usernameAvailabilityAndCharacterCounter = (
    <div className = "flex flex-none gap-2 items-center">
      {getUsernameStatusIcon()}
      <span>{characterCount}/20</span>
    </div>
  )

  const emailAvailabilityAndCharacterCounter = (
    <div className = "flex flex-none items-center">
      {getEmailStatusIcon()}
    </div>
  )

  return (
    <form className = "flex flex-col gap-4 w-full" noValidate>
      <label className = {labelClassName}>
        <IconUsername className = "w-5 h-5" />

        <input
          type = "text"
          placeholder = {translations("usernamePlaceholder")}
          className = {inputClassName}
          required
          autoComplete = "username"
          minLength = {3}
          maxLength = {20}
          pattern = "^[A-Za-z0-9_]+$"
          onChange = {(e) => {
            handleInputChange(e)
            handleUsernameChange(e)
          }}
          autoFocus
        />

        {usernameAvailabilityAndCharacterCounter}
      </label>

      <label className = {labelClassName}>
        <IconEmail className = "w-5 h-5" />

        <input
          type = "email"
          placeholder = {translations("emailPlaceholder")}
          className = {inputClassName}
          required
          minLength = {5}
          onChange = {handleEmailChange}
          autoComplete = "email"
        />

        {emailAvailabilityAndCharacterCounter}
      </label>

      <label className = {labelClassName}>
        <IconPassword className = "w-5 h-5" />

        <input
          type = "password"
          placeholder = {translations("passwordPlaceholder")}
          className = {inputClassName}
          required
          onChange = {handleInputChange}
        />
      </label>

      <label className = {labelClassName}>
        <IconConfirmPasswordBefore className = "w-5 h-5" />

        <input
          type = "password"
          placeholder = {translations("confirmPasswordPlaceholder")}
          className = {inputClassName}
          required
          onChange = {handleInputChange}
        />
      </label>

      <button
        type = "submit"
        className = "w-full px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-xl transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:bg-red-200"
        disabled = {!areAllFieldsFilled || usernameStatus !== "available"}
      >
        {translations("signUpButton")}
      </button>
    </form>
  )
}
