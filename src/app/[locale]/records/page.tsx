import { redirect } from "next/navigation"
import PersonalRecords from "../../../components/game/PersonalRecords"
import PreferencesIndex from "../../../components/preferences"
import BackHomeButton from "../../../components/ui/BackHomeButton"
import ProfileDropdown from "../../../components/user/ProfileDropdown"
import GetCurrentUserProfile from "../../../utils/GetCurrentUserProfile"

export default async function PersonalRecordsPage() {
  const { userProfile, isLoggedIn } = await GetCurrentUserProfile()

  // Redirect to home if user is not logged in
  if (!isLoggedIn || !userProfile) {
    redirect("/")
  }

  return (
    <>
      <BackHomeButton />
      <ProfileDropdown user = {userProfile} />
      <PersonalRecords userId = {userProfile.id} />
      <PreferencesIndex />
    </>
  )
}
