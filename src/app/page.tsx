import fetchRandomPopularMovie from "@/utils/tmdb"
import Game from "@/components/Game"

export default async function Home() {
  const movie = await fetchRandomPopularMovie()

  return (
    <main className = "flex min-h-screen flex-col items-center justify-between p-24 bg-black">
      <h1 className = "text-4xl font-bold text-white">FrameGuesser</h1>

      <Game movie = { movie } />
    </main>
  )
}
