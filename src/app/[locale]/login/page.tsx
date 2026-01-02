"use client"

import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import LoginForm from "../../../components/login-page/forms/LogIn"
import SignupForm from "../../../components/login-page/forms/SignUp"
import IconGoBack from "../../../components/login-page/GoBackIcon"
import { IconAppleDark, IconAppleLight, IconGitHubDark, IconGitHubLight, IconGoogle, IconMicrosoft } from "../../../components/login-page/SocialIcons"
import PreferencesIndex from "../../../components/preferences"
import { useAuth } from "../../../hooks/useAuth"

export default function FormsPage() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()

  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const translations = useTranslations("loginPage")
  const [isLoginOrSignup, setIsLoginOrSignup] = useState(true) // true for login, false for signup. deafult to login

  useEffect(() => {
    if (!loading && isLoggedIn) {
      router.push("/play")
    }
  }, [isLoggedIn, loading, router])

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 0)

    return () => clearTimeout(timeout)
  }, [])

  if (loading) {
    return (
      <main className = "flex flex-col items-center justify-center min-h-screen">
        <p>Loading...</p> {/* todo: make this way fancier */}
      </main>
    )
  }

  const socialIconsSize = "w-7 h-7"

  const GitHubIcon = mounted && resolvedTheme === "light" ? IconGitHubLight : IconGitHubDark
  const AppleIcon = mounted && resolvedTheme === "light" ? IconAppleLight : IconAppleDark

  const socialIcons = [
    <IconGoogle key = "google" className = {socialIconsSize} />,
    <GitHubIcon key = "github" className = {socialIconsSize} />,
    <AppleIcon key = "apple" className = {socialIconsSize} />,
    <IconMicrosoft key = "microsoft" className = {socialIconsSize} />
  ]

  const tabButtonsClassName = `flex justify-center items-center w-full py-4 px-30 cursor-pointer max-w-1/2 group`
  const tabTitleClassName = "text-xl whitespace-nowrap font-karnak-pro-bold tracking-wide"

  return (
    <main className = "flex flex-col items-center justify-start min-h-screen pt-5 pb-20 gap-5">
      <div className = "self-start ml-5">
        <Link 
          href = "/" 
          className = "flex items-center justify-start gap-2 font-medium text-white bg-red-500 px-6 py-3 rounded-full text-lg hover:scale-110 transition-all duration-100 active:scale-100 hover:shadow-lg shadow-red-500/50" // two or more transitions with different durations: {animation-itself} {animation2-itself} transition-[animation,animation2] duration-[duration+metric,duration2+metric]
        >
          <IconGoBack />
          <span>{translations("backHome")}</span>
        </Link>
      </div>

      <Link href = "/">
        <Image
          src = "/logo.png"
          alt = "FrameGuesser Logo"
          width = {400}
          height = {400}
          priority
        />
      </Link>

      <section className = "flex flex-col items-center justify-start gap-4">
        <div>
          <h1 className = "text-5xl font-askan-demibold mb-2 text-center">
            {translations(`${isLoginOrSignup ? "login" : "signup"}.welcome`)}
          </h1>
          <p className = "text-lg text-center font-system-ui mb-6">
            {translations(`${isLoginOrSignup ? "login" : "signup"}.prompt`)}
          </p>
        </div>

        <div className = "relative flex flex-col items-center justify-center bg-white dark:bg-neutral-800 rounded-3xl border-[#d3d5da] dark:border-neutral-700 border-2 overflow-hidden pb-10">
          <div className = "flex w-full">
            <button
              onClick = {() => setIsLoginOrSignup(true)}
              className = {`${tabButtonsClassName} ${isLoginOrSignup && "bg-[#d3d5da] dark:bg-neutral-700"} transition-colors duration-300`}
            >
              <h2 className = {tabTitleClassName}>{translations("tabs.login")}</h2>
            </button>

            <button
              onClick = {() => setIsLoginOrSignup(false)}
              className = {`${tabButtonsClassName} ${!isLoginOrSignup && "bg-[#d3d5da] dark:bg-neutral-700"} transition-colors duration-300`}
            >
              <h2 className = {tabTitleClassName}>{translations("tabs.signup")}</h2>
            </button>
          </div>

          <div className = {`w-1/2 h-0.75 bg-red-500 shadow-[0_0_10px_#ef4444] transition-transform duration-300 self-start ${isLoginOrSignup ? "translate-x-0" : "translate-x-full"}`} />

          <div className = "w-full h-px bg-[#d3d5da] dark:bg-neutral-700 mb-7" />

          <div className = "flex flex-col items-center justify-center gap-6 w-85/100">
            <div className = "grid grid-cols-4 justify-items-center items-center w-full gap-6">
              {socialIcons.map((IconComponent, index) => (
                <button
                  key = {index}
                  className = "inline-flex items-center justify-center cursor-pointer p-4 rounded-xl bg-neutral-100 ring-2 ring-neutral-200 hover:bg-neutral-200 dark:bg-neutral-700 dark:ring-neutral-600 dark:hover:bg-neutral-600 transition-colors duration-150"
                >
                  {IconComponent}
                </button>
              ))}
            </div>

            <div className = "flex items-center w-full gap-4 text-neutral-600 dark:text-neutral-300 font-corporatespro-medium uppercase tracking-wide">
              <hr className = "w-full h-0.5 translate-y-0.5" />
              <h5 className = "min-w-max">{translations("form.alternative")}</h5>
              <hr className = "w-full h-0.5 translate-y-0.5" />
            </div>

            {isLoginOrSignup ? <LoginForm /> : <SignupForm />}
          </div>
        </div>
      </section>

      <PreferencesIndex />
    </main>
  )
}
