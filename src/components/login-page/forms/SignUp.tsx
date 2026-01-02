"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { useEmailAvailability } from "../../../hooks/useEmailAvailability"
import { usePasswordValidation } from "../../../hooks/usePasswordValidation"
import { useUsernameAvailability } from "../../../hooks/useUsernameAvailability"
import { IconCheckmark, IconConfirmPassword, IconConfirmPasswordBefore, IconConfirmPasswordCorrect, IconConfirmPasswordNotMatching, IconEmail, IconEmailUnavailable, IconHidePassword, IconLoading, IconNotValidField, IconPassword, IconShowPassword, IconUnavailableUsername, IconUsername } from "../InputIcons"

const labelClassName = "flex gap-2 items-center w-full px-4 py-2 border bg-neutral-100 ring-neutral-200 ring-1 border-none hover:bg-neutral-200 rounded-xl transition-colors duration-150 font-robotoslab-medium text-black placeholder:font-robotoslab-bold group dark:bg-neutral-700 dark:ring-neutral-600 dark:hover:bg-neutral-600 dark:text-white"
const inputClassName = "w-full focus:outline-none flex-1"

export default function SignupForm() {
  const translations = useTranslations("signUpForm")

  const [areAllFieldsFilled, setAreAllFieldsFilled] = useState(false)
  const { status: usernameStatus, checkUsername } = useUsernameAvailability()
  const { status: emailStatus, checkEmail } = useEmailAvailability()
  const { status: passwordStatus, validatePassword } = usePasswordValidation()

  const [usernameFieldCharacterCount, setUsernameFieldCharacterCount] = useState(0)

  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [confirmPasswordStatus, setConfirmPasswordStatus] = useState<"idle" | "matching" | "notmatching">("idle")

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
        return <IconEmailUnavailable className = "w-5 h-5 text-red-500" />
      case "invalid":
        return <IconEmailUnavailable className = "w-5 h-5 text-red-500" />
      case "idle":
      default:
        return <IconCheckmark className = "w-5 h-5 text-neutral-300" />
    }
  }

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value
    setPassword(newPassword)
    validatePassword(newPassword)
    if (confirmPassword) {
      updateConfirmPasswordStatus(newPassword, confirmPassword)
    }
  }

  const getPasswordStatusIcon = () => {
    switch (passwordStatus) {
      case "valid":
        return <IconCheckmark className = "w-5 h-5 text-green-500" />
      case "invalid":
        return <IconNotValidField className = "w-5 h-5 text-red-500" />
      case "checking":
        return <IconLoading className = "w-5 h-5 text-neutral-300 animate-[spin_1s_linear_infinite_reverse]" />
      case "idle":
      default:
        return <IconCheckmark className = "w-5 h-5 text-neutral-300" />
    }
  }

    const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = event.target.value
    setConfirmPassword(newConfirmPassword)
    if (newConfirmPassword) {
      updateConfirmPasswordStatus(password, newConfirmPassword)
    } else {
      setConfirmPasswordStatus("idle")
    }
  }

  const updateConfirmPasswordStatus = (pwd: string, confirmPwd: string) => {
    if (pwd === confirmPwd && confirmPwd !== "") {
      setConfirmPasswordStatus("matching")
    } else if (confirmPwd !== "" && pwd !== confirmPwd) {
      setConfirmPasswordStatus("notmatching")
    } else {
      setConfirmPasswordStatus("idle")
    }
  }

  const getConfirmPasswordStatusIcon = () => {
    switch (confirmPasswordStatus) {
      case "matching":
        return <IconConfirmPasswordCorrect className = "w-5 h-5 text-green-500" />
      case "notmatching":
        return <IconConfirmPasswordNotMatching className = "w-5 h-5 text-red-500" />
      case "idle":
      default:
        return <IconConfirmPasswordBefore className = "w-5 h-5 text-neutral-300" />
    }
  }

  const getUsernameLiveCharacterCount = (event: Event) => {
    const input = event.target as HTMLInputElement
    setUsernameFieldCharacterCount(input.value.length)
  }

  useEffect(() => {
    const usernameField = document.querySelector('input[type="text"]') as HTMLInputElement | null
    if (!usernameField) return
    usernameField.addEventListener("input", getUsernameLiveCharacterCount)

    return () => {
      usernameField.removeEventListener("input", getUsernameLiveCharacterCount)
    }
  }, [])

  const usernameAvailabilityAndCharacterCounter = (
    <div className = "flex flex-none gap-2 items-center">
      {getUsernameStatusIcon()}
      <span>{usernameFieldCharacterCount}/20</span>
    </div>
  )

  const emailAvailabilityAndCharacterCounter = (
    <div className = "flex flex-none items-center">
      {getEmailStatusIcon()}
    </div>
  )

  const passwordAvailabilityAndVisibilityToggle = (
    <div className = "flex flex-none gap-2 items-center">
      {getPasswordStatusIcon()}

      <button
        type = "button"
        className = "cursor-pointer"
        onClick = {() => setIsPasswordShown(!isPasswordShown)}
      >
        {isPasswordShown ? <IconHidePassword className = "w-5 h-5" /> : <IconShowPassword className = "w-5 h-5" />}
      </button>
    </div>
  )

  const confirmPasswordStatusAndVisibilityToggle = (
    <div className = "flex flex-none gap-2 items-center">
      {getConfirmPasswordStatusIcon()}

      <button
        type = "button"
        className = "cursor-pointer"
        onClick = {() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
      >
        {isConfirmPasswordShown ? <IconHidePassword className = "w-5 h-5" /> : <IconShowPassword className = "w-5 h-5" />}
      </button>
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
          minLength = {3}
          maxLength = {254}
          onChange = {(e) => {
            handleInputChange(e)
            handleEmailChange(e)
          }}
        />

        {emailAvailabilityAndCharacterCounter}
      </label>

      <label className = {labelClassName}>
        <IconPassword className = "w-5 h-5" />

        <input
          type = {isPasswordShown ? "text" : "password"}
          placeholder = {translations("passwordPlaceholder")}
          className = {inputClassName}
          required
          onChange = {(e) => {
            handleInputChange(e)
            handlePasswordChange(e)
          }}
          minLength = {8}
          pattern = "^\\S+$"
        />

        {passwordAvailabilityAndVisibilityToggle}
      </label>

      <label className = {labelClassName}>
        <IconConfirmPassword className = "w-5 h-5" />

        <input
          type = {isConfirmPasswordShown ? "text" : "password"}
          placeholder = {translations("confirmPasswordPlaceholder")}
          className = {inputClassName}
          required
          onChange = {(e) => {
            handleInputChange(e)
            handleConfirmPasswordChange(e)
          }}
          pattern = "^\\S+$"
        />

        {confirmPasswordStatusAndVisibilityToggle}
      </label>

      <button
        type = "submit"
        className = "w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:bg-neutral-300 dark:disabled:bg-neutral-900 dark:bg-neutral-300 dark:text-black dark:disabled:text-white dark:hover:bg-neutral-100 font-robotoslab-bold text-lg"
        disabled = {!areAllFieldsFilled || usernameStatus !== "available" || emailStatus !== "available" || passwordStatus !== "valid" || confirmPasswordStatus !== "matching"}
      >
        {translations("signUpButton")}
      </button>
    </form>
  )
}
