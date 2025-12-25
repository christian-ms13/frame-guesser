"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import LoginForm from "../../../components/login-page/forms/LogIn"
import SignupForm from "../../../components/login-page/forms/SignUp"
import IconGoBack from "../../../components/login-page/GoBackIcon"
import { IconApple, IconGitHub, IconGoogle, IconMicrosoft } from "../../../components/login-page/SocialIcons"
import PreferencesIndex from "../../../components/preferences"
import { useAuth } from "../../../hooks/useAuth"

export default function FormsPage() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()

  const translations = useTranslations("loginPage")
  const [isLoginOrSignup, setIsLoginOrSignup] = useState(true) // true for login, false for signup. deafult to login

  useEffect(() => {
    if (!loading && isLoggedIn) {
      router.push("/game")
    }
  }, [isLoggedIn, loading, router])

  if (loading) {
    return (
      <main className = "flex flex-col items-center justify-center min-h-screen">
        <p>Loading...</p> {/* todo: make this way fancier */}
      </main>
    )
  }

  const tabButtonsClassName = `flex justify-center items-center w-full py-4 px-30 cursor-pointer max-w-1/2 group`
  const tabTitleClassName = "text-xl whitespace-nowrap font-karnak-pro-bold tracking-wide"

  return (
    <main className = "flex flex-col items-center justify-start min-h-screen pt-5 pb-20 gap-5">
      <div className = "self-start ml-5">
        <Link 
          href = "/" 
          className = "flex items-center justify-start gap-2 font-medium text-white bg-red-500 px-6 py-3 rounded-full text-lg hover:scale-110 transition-transform duration-70 active:scale-100" // two or more transitions with different durations: {animation-itself} {animation2-itself} transition-[animation,animation2] duration-[duration+metric,duration2-metric]
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

        <div className = "relative flex flex-col items-center justify-center bg-white dark:bg-neutral-800 rounded-3xl border-[#d3d5da] dark:border-neutral-700 border-2 overflow-hidden">
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

          <div className = {`w-1/2 h-0.75 bg-red-500 transition-transform duration-300 self-start ${isLoginOrSignup ? "translate-x-0" : "translate-x-full"}`} />

          <div className = "w-full h-px bg-[#d3d5da] dark:bg-neutral-700 mb-7" />

          <div className = "flex flex-col items-center justify-center gap-6 w-85/100">
            <div className = "grid grid-cols-2 gap-8">
              <IconGoogle className = "w-10 h-10" />
              <IconGitHub className = "w-10 h-10" />
              <IconApple className = "w-10 h-10" />
              <IconMicrosoft className = "w-10 h-10" />
            </div>

            <div className = "flex items-center w-full gap-4 text-neutral-600 dark:text-neutral-300 font-bignoodletitling-regular tracking-widest">
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
