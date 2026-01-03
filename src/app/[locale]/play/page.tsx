import { redirect } from "next/navigation"

import Game from "../../../components/game/Game"
import { createClient } from "../../../utils/supabase/server"
import fetchRandomMovie from "../../../utils/tmdb"

export default async function GamePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { locale } = await params

  if (!user) {
    redirect(`/${locale}/login`)
  }

  const randomMovie = await fetchRandomMovie()

  return (
    <Game movie = {randomMovie} />
  )
}
