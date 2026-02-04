"use client"

import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"

import LoginForm from "../../../components/login-page/forms/LogIn"
import SignupForm from "../../../components/login-page/forms/SignUp"
import PreferencesIndex from "../../../components/preferences"
import BackHomeButton from "../../../components/ui/BackHomeButton"
import { useAuth } from "../../../hooks/useAuth"

export default function FormsPage() {
  const { isLoggedIn } = useAuth()
  const locale = useLocale()

  const translations = useTranslations("loginPage")
  const [isLoginOrSignup, setIsLoginOrSignup] = useState(true) // true for login, false for signup. default to login

  useEffect(() => {
    if (isLoggedIn) {
      redirect(`/${locale}/play`)
    }
  }, [isLoggedIn, locale])

  const tabButtonsClassName = `flex justify-center items-center w-full py-4 px-30 cursor-pointer max-w-1/2 group`
  const tabTitleClassName = "text-xl whitespace-nowrap font-karnak-pro-bold tracking-wide"

  return (
    <>
      <BackHomeButton />

      <div className = "flex flex-col items-center justify-start">
        <Link href = "/">
          <Image
            src = "/logo.png"
            alt = "FrameGuesser Logo"
            width = {400}
            height = {400}
            priority
            className = ""
          />
        </Link>

        <section className = "flex flex-col items-center justify-start gap-4">
          <div className = "flex flex-col items-center justify-center">
            <h1 className = "text-5xl font-askan-demibold mb-2 text-center">
              {translations(`${isLoginOrSignup ? "login" : "signup"}.welcome`)}
            </h1>
            <p className = "text-lg text-center font-system-ui mb-6 max-w-2xl px-4">
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
              {isLoginOrSignup ? <LoginForm /> : <SignupForm />}
            </div>
          </div>
        </section>
      </div>

      <PreferencesIndex />
    </>
  )
}
