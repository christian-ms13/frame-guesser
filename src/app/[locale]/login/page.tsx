"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import PreferencesIndex from "../../../components/preferences"
import { useAuth } from "../../../hooks/useAuth"
import LoginForm from "../../../components/login-page/forms/LogIn"
import SignupForm from "../../../components/login-page/forms/SignUp"

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
        <p>Loading...</p>
      </main>
    )
  }

  return (
    <main className = "flex flex-col items-center justify-start min-h-screen pt-5 pb-20">
      <Link href = "/">
        <Image
          src = "/logo.png"
          alt = "FrameGuesser Logo"
          width = {400}
          height = {400}
          priority
        />
      </Link>

      <section className = "flex flex-col items-center justify-start">
        <div>
          <h1 className = "text-4xl font-bold text-center">{translations(`${isLoginOrSignup ? "login" : "signup"}.welcome`)}</h1>
          <p className = "text-lg text-center">{translations(`${isLoginOrSignup ? "login" : "signup"}.prompt`)}</p>
        </div>

        <div className = "flex flex-col items-center justify-center">
          <div>
            <button
              onClick = {() => setIsLoginOrSignup(true)}
            >
              <h2>{translations("tabs.login")}</h2>
            </button>

            <button
              onClick = {() => setIsLoginOrSignup(false)}
            >
              <h2>{translations("tabs.signup")}</h2>
            </button>
          </div>

          <div></div>

          {isLoginOrSignup ? <LoginForm /> : <SignupForm />}
        </div>
      </section>

      <PreferencesIndex />
    </main>
  )
}
