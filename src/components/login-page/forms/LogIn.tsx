"use client"

import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { signInUser } from "../../../utils/supabase/actions"
import { IconEmail, IconHidePassword, IconPassword, IconShowPassword } from "../InputIcons"
import { IconAppleDark, IconAppleLight, IconGitHubDark, IconGitHubLight, IconGoogle, IconMicrosoft } from "../SocialIcons"

const labelClassName = "flex gap-2 items-center w-full px-4 py-2 border bg-neutral-100 ring-neutral-200 ring-1 border-none hover:bg-neutral-200 rounded-xl transition-colors duration-150 font-robotoslab-medium text-black placeholder:font-robotoslab-bold group dark:bg-neutral-700 dark:ring-neutral-600 dark:hover:bg-neutral-600 dark:text-white"
const inputClassName = "w-full focus:outline-none flex-1"

export default function LoginForm() {
  const translations = useTranslations("loginForm")
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [areAllFieldsFilled, setAreAllFieldsFilled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 0)

    return () => clearTimeout(timeout)
  }, [])

  const socialIconsSize = "w-7 h-7"

  const GitHubIcon = mounted && resolvedTheme === "light" ? IconGitHubLight : IconGitHubDark
  const AppleIcon = mounted && resolvedTheme === "light" ? IconAppleLight : IconAppleDark

  const socialIcons = [
    <IconGoogle key = "google" className = {socialIconsSize} />,
    <GitHubIcon key = "github" className = {socialIconsSize} />,
    <AppleIcon key = "apple" className = {socialIconsSize} />,
    <IconMicrosoft key = "microsoft" className = {socialIconsSize} />
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!areAllFieldsFilled || isSubmitting) return

    setIsSubmitting(true)

    try {
      const result = await signInUser(email, password)

      if (result.success) {
        router.push("/play")
      } else {
        alert(`Login failed: ${result.error ?? "Unknown error"}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className = "grid grid-cols-4 justify-items-center items-center w-full gap-6">
        {socialIcons.map((IconComponent, index) => (
          <button
            key = {index}
            type = "button"
            className = "inline-flex items-center justify-center cursor-pointer p-4 rounded-xl bg-neutral-100 ring-2 ring-neutral-200 hover:bg-neutral-200 dark:bg-neutral-700 dark:ring-neutral-600 dark:hover:bg-neutral-600 transition-colors duration-150"
          >
            {IconComponent}
          </button>
        ))}
      </div>

      <div className = "flex items-center w-full gap-4 text-neutral-600 dark:text-neutral-300 font-corporatespro-medium uppercase tracking-wide">
        <hr className = "w-full h-0.5 translate-y-0.5" />
        <h5 className = "min-w-max">{translations("alternative")}</h5>
        <hr className = "w-full h-0.5 translate-y-0.5" />
      </div>

      <form className = "flex flex-col gap-4 w-full" onSubmit = {handleSubmit}>
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
          value = {email}
          onChange = {(e) => {
            setEmail(e.target.value)
            handleInputChange(e)
          }}
          autoFocus
        />
      </label>

      <label className = {labelClassName}>
        <IconPassword className = "w-5 h-5" />

        <input
          type = {isPasswordShown ? "text" : "password"}
          placeholder = {translations("passwordPlaceholder")}
          className = {inputClassName}
          autoComplete = "current-password"
          required
          value = {password}
          onChange = {(e) => {
            setPassword(e.target.value)
            handleInputChange(e)
          }}
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
        disabled = {!areAllFieldsFilled || isSubmitting}
      >
        {isSubmitting ? `${translations("loginButton")}...` : translations("loginButton")}
      </button>
      </form>
    </>
  )
}
