import { getTranslations } from "next-intl/server"
import Image from "next/image"

import AnimatedLinkButton from "../../components/home-page/AnimatedLinkButton"
import PlayButton from "../../components/home-page/PlayButton"
import { IconCode, IconLeaderboard, IconPersonalRecords } from "../../components/home-page/actions/LinkIcons"
import PreferencesIndex from "../../components/preferences"
import ProfileDropdown from "../../components/user/ProfileDropdown"
import GetCurrentUserProfile from "../../utils/GetCurrentUserProfile"

export default async function Home() {
  const translations = await getTranslations("homePage")

  const { userProfile, isLoggedIn } = await GetCurrentUserProfile()

  const linkStyle = "text-xl flex gap-2 items-center justify-center px-5 py-3 rounded-full transition-all duration-100 ease-out hover:scale-115 active:scale-100 hover:shadow-lg shadow-black/50 dark:shadow-white/20 relative overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600"

  return (
    <div className = "flex flex-col items-center justify-start">
      <Image
        src = "/logo.png"
        alt = "FrameGuesser Logo"
        width = {600}
        height = {600}
        priority
        className = ""
      />

      <h1 className = "text-7xl font-karnak-condensed-black">FrameGuesser</h1>

      <h3 className = "text-3xl mt-5 mb-15 font-karnak-light tracking-wide text-center">
        {translations("subtitle")}
      </h3>

      {isLoggedIn && <ProfileDropdown user = {userProfile} />}

      <div className = "grid grid-cols-2 grid-rows-2 gap-10">
        <AnimatedLinkButton
          href = "https://github.com/chriistianms/frame-guesser"
          target = "_blank"
          icon = {<IconCode className = "w-full h-full" />}
          text = "GitHub"
          bgGif = "/home-page/code-bg.gif"
          linkStyle = {linkStyle}
        />

        <PlayButton
          href = {isLoggedIn ? "/play" : "/login"}
          linkStyle = {linkStyle}
        />

        <AnimatedLinkButton
          href = "/leaderboard"
          icon = {<IconLeaderboard className = "w-full h-full" />}
          text = {translations("leaderboard")}
          bgGif = "/home-page/leaderboard-bg.gif"
          linkStyle = {linkStyle}
        />

        <AnimatedLinkButton
          href = "/records"
          icon = {<IconPersonalRecords className = "w-full h-full" />}
          text = {translations("myRecords")}
          bgGif = "/home-page/records-bg.gif"
          linkStyle = {linkStyle}
        />
      </div>

      <PreferencesIndex />
    </div>
  )
}
