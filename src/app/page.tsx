import Image from "next/image"

import PreferencesIndex from "@/components/preferences"

export default async function Home() {
  return (
    <main className = "flex min-h-screen flex-col items-center justify-start bg-gray-950 text-white pt-25 cursor-default select-none">
      <Image
        src = "/logo.png"
        alt = "FrameGuesser Logo"
        width = {600}
        height = {600}
        priority
      />

      <h1 className = "text-6xl font-karnak-condensed-black">FrameGuesser</h1>

      <PreferencesIndex />
    </main>
  )
}
