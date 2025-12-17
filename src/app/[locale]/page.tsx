import Image from "next/image"
import { useTranslations } from "next-intl"

import PreferencesIndex from "@/components/preferences"

export default function Home() {
  const t = useTranslations("HomePage")

  return (
    <main className = "flex min-h-screen flex-col items-center justify-start bg-gray-950 text-white pt-25 cursor-default select-none">
      <Image
        src = "/logo.png"
        alt = "FrameGuesser Logo"
        width = {600}
        height = {600}
        priority
      />

      <h1 className = "text-7xl font-karnak-condensed-black">FrameGuesser</h1>

      <h3 className = "text-3xl mt-4 font-karnak-light tracking-wide">{t("subtitle")}</h3>

      <PreferencesIndex className = "absolute bottom-0 right-0 pe-10 pb-5" />
    </main>
  )
}
