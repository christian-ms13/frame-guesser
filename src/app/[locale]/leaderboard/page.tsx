import Leaderboard from "../../../components/game/Leaderboard"
import PreferencesIndex from "../../../components/preferences"
import BackHomeButton from "../../../components/ui/BackHomeButton"
import ProfileDropdown from "../../../components/user/ProfileDropdown"
import GetCurrentUserProfile from "../../../utils/GetCurrentUserProfile"

export default async function LeaderboardPage() {
  const { userProfile, isLoggedIn } = await GetCurrentUserProfile()

  return (
    <>
      <BackHomeButton />
      {isLoggedIn && <ProfileDropdown user = {userProfile} />}
      <Leaderboard />
      <PreferencesIndex />
    </>
  )
}
