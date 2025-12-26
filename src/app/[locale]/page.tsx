import { getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"

import { IconCode, IconPlay } from "../../components/home-page/actions/LinkIcons"
import PreferencesIndex from "../../components/preferences"
import { createClient } from "../../utils/supabase/server"

export default async function Home() {
  const translations = await getTranslations("homePage")

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  const linkStyle = "text-xl flex gap-2 items-center justify-center px-5 py-3 rounded-full transition-all duration-100 ease-out hover:scale-115 active:scale-100 hover:shadow-lg shadow-black/50 dark:shadow-white/20 relative overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600"

  return (
    <main className = "pb-20 flex min-h-screen flex-col items-center justify-start pt-5">
      <Image
        src = "/logo.png"
        alt = "FrameGuesser Logo"
        width = {600}
        height = {600}
        priority
      />

      <h1 className = "text-7xl font-karnak-condensed-black">FrameGuesser</h1>

      <h3 className = "text-3xl mt-5 mb-15 font-karnak-light tracking-wide">
        {translations("subtitle")}
      </h3>

      <div className = "grid grid-flow-col auto-cols-[minmax(max-content,1fr)] gap-10">
        <Link
          href = "https://github.com/christian-ms13/frame-guesser"
          target = "_blank"
          className = {`${linkStyle} font-googlesanscode-light border-2 border-[#121212] dark:border-[#e3e3e1] relative overflow-hidden group`}
        >
          <div className = "absolute inset-0 bg-[url('/home-page/code-bg.gif')] bg-cover bg-center opacity-0 group-hover:opacity-100 transition-opacity duration-350 z-0" />
          <div className = "absolute inset-0 bg-black/47 opacity-0 group-hover:opacity-100 transition-opacity duration-350 z-0" />
          <IconCode className = "w-6 h-6 relative z-10 group-hover:text-[#e3e3e1] duration-50" />
          <span className = "relative z-10 group-hover:text-[#e3e3e1] duration-50">GitHub</span>
        </Link>

        <Link
          href = {isLoggedIn ? "/play" : "/login"}
          className = {`${linkStyle} font-play-bold bg-[#121212] text-[#e3e3e1] dark:bg-[#e3e3e1] dark:text-[#121212]`}
        >
          <IconPlay className = "w-6 h-6" />
          <span>{translations("play")}</span>
        </Link>
      </div>

      <PreferencesIndex />
    </main>
  )
}
