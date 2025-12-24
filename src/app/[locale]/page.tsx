import { getTranslations } from "next-intl/server"
import Image from "next/image"

import PreferencesIndex from "../../components/preferences"
import { createClient } from "../../utils/supabase/server"

export default async function Home() {
  const translations = await getTranslations("homePage")

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <main className = "flex min-h-screen flex-col items-center justify-start pt-25 cursor-default select-none bg-[#e3e3e1] text-[#121212] dark:bg-[#121212] dark:text-[#e3e3e1]">
      <Image
        src = "/logo.png"
        alt = "FrameGuesser Logo"
        width = {600}
        height = {600}
        priority
      />

      <h1 className = "text-7xl font-karnak-condensed-black">FrameGuesser</h1>

      <h3 className = "text-3xl mt-5 font-karnak-light tracking-wide">
        {translations("subtitle")}
      </h3>

      {isLoggedIn ? (
        <p>welcome back</p>
      ) : (
        <p>not logged in</p>
      )}

      <PreferencesIndex className = "fixed bottom-0 w-full pb-5 z-40" />
    </main>
  )
}
