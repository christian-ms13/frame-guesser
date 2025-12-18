import Image from "next/image"
import { useTranslations } from "next-intl"

import PreferencesIndex from "@/components/preferences"

export default function Home() {
  const t = useTranslations("HomePage")

  return (
    <main className = "flex min-h-screen flex-col items-center justify-start pt-25 cursor-default select-none bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">
      <Image
        src = "/logo.png"
        alt = "FrameGuesser Logo"
        width = {600}
        height = {600}
        priority
      />

      <h1 className = "text-7xl font-karnak-condensed-black">FrameGuesser</h1>

      <h3 className = "text-3xl mt-5 font-karnak-light tracking-wide min-h-500">{t("subtitle")}</h3>

      <PreferencesIndex className = "sticky bottom-0 pb-5" />
    </main>
  )
}
