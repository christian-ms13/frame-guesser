import { redirect } from "next/navigation"

import Game from "../../../components/game/Game"
import PreferencesIndex from "../../../components/preferences"
import BackHomeButton from "../../../components/ui/BackHomeButton"
import ProfileDropdown from "../../../components/user/ProfileDropdown"
import GetCurrentUserProfile from "../../../utils/GetCurrentUserProfile"
import fetchRandomMovie from "../../../utils/tmdb"

export default async function GamePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const { userProfile, isLoggedIn } = await GetCurrentUserProfile()

  if (!isLoggedIn) {
    redirect(`/${locale}/login`)
  }

  const randomMovie = await fetchRandomMovie()

  return (
    <>
      <BackHomeButton />
      <ProfileDropdown user = {userProfile} />
      <Game movie = {randomMovie} />
      <PreferencesIndex />
    </>
  )
}
