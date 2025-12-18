import Image from "next/image"
import { useTranslations } from "next-intl"

import PreferencesIndex from "@/components/preferences"

export default function Home() {
  const t = useTranslations("HomePage")

  return (
    <main className = "flex min-h-screen flex-col items-center justify-start pt-25 cursor-default select-none bg-[#E3E3E1] text-[#121212] dark:bg-[#121212] dark:text-[#E3E3E1]">
      <Image
        src = "/logo.png"
        alt = "FrameGuesser Logo"
        width = {600}
        height = {600}
        priority
      />

      <h1 className = "text-7xl font-karnak-condensed-black">FrameGuesser</h1>

      <h3 className = "text-3xl mt-5 font-karnak-light tracking-wide min-h-500">{t("subtitle")}</h3>

      <PreferencesIndex className = "fixed bottom-0 w-full pb-5 z-40" />
    </main>
  )
}
