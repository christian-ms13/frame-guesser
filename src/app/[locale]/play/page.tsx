import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"

import Game from "../../../components/game/Game"
import PreferencesIndex from "../../../components/preferences"
import BackHomeButton from "../../../components/ui/BackHomeButton"
import ProfileDropdown from "../../../components/user/ProfileDropdown"
import GetCurrentUserProfile from "../../../utils/GetCurrentUserProfile"
import { fetchMultipleMovies } from "../../../utils/tmdb"

export default async function GamePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const translations = await getTranslations("gamePage")

  const { locale } = await params

  const { userProfile, isLoggedIn } = await GetCurrentUserProfile()

  if (!isLoggedIn) {
    redirect(`/${locale}/login`)
  }

  // Provide placeholder movies - actual movies will be fetched on game start
  const movies = await fetchMultipleMovies(10)

  return (
    <>
      <BackHomeButton />
      {isLoggedIn && <ProfileDropdown user = {userProfile} />}
      {!movies ? (
        <div className = "min-h-[90vh] w-full flex items-center justify-center">
          <p className = "text-center">{translations("unableToLoadGame")}</p>
        </div>
      ) : (
        <Game movies = {movies} />
      )}
      <PreferencesIndex />
    </>
  )
}
