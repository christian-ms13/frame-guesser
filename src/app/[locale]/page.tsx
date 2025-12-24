import Link from "next/link"
import { getTranslations } from "next-intl/server"
import Image from "next/image"

import PreferencesIndex from "../../components/preferences"
import { createClient } from "../../utils/supabase/server"
import { IconCode, IconPlay } from "../../components/home-page/actions/LinkIcons"

export default async function Home() {
  const translations = await getTranslations("homePage")

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  const linkStyle = "text-xl flex gap-2 items-center justify-center px-5 py-3 rounded-full cursor-pointer transition-transform duration-70 ease-out hover:scale-115 active:scale-100"

  return (
    <main className = "pb-20 flex min-h-screen flex-col items-center justify-start pt-25 cursor-default select-none bg-[#e3e3e1] text-[#121212] dark:bg-[#121212] dark:text-[#e3e3e1]">
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

      <PreferencesIndex className = "fixed bottom-0 w-full pb-5 z-40" />
    </main>
  )
}
