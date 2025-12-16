import Image from "next/image"

export default async function Home() {
  return (
    <main className = "flex min-h-screen flex-col items-center justify-center bg-gray-950 text-white">
      <Image
        src = "/logo.png"
        alt = "FrameGuesser Logo"
        width = {300}
        height = {300}
        priority
      />

      <h1 className = "text-5xl font-karnak-condensed-black ">FrameGuesser</h1>
    </main>
  )
}
