import { redirect } from "next/navigation"
import PersonalRecords from "../../../components/game/PersonalRecords"
import PreferencesIndex from "../../../components/preferences"
import BackHomeButton from "../../../components/ui/BackHomeButton"
import ProfileDropdown from "../../../components/user/ProfileDropdown"
import GetCurrentUserProfile from "../../../utils/GetCurrentUserProfile"

export default async function PersonalRecordsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const { userProfile, isLoggedIn } = await GetCurrentUserProfile()

  if (!isLoggedIn || !userProfile) {
    redirect(`/${locale}/login`)
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
