import { getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"

import AnimatedLinkButton from "@/components/home-page/AnimatedLinkButton"
import { IconCode, IconLeaderboard, IconPersonalRecords, IconPlay } from "../../components/home-page/actions/LinkIcons"
import PreferencesIndex from "../../components/preferences"
import ProfileDropdown from "../../components/user/ProfileDropdown"
import GetCurrentUserProfile from "../../utils/GetCurrentUserProfile"

export default async function Home() {
  const translations = await getTranslations("homePage")

  const { userProfile, isLoggedIn } = await GetCurrentUserProfile()

  const linkStyle = "text-xl flex gap-2 items-center justify-center px-5 py-3 rounded-full transition-all duration-100 ease-out hover:scale-115 active:scale-100 hover:shadow-lg shadow-black/50 dark:shadow-white/20 relative overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600"

  return (
    <>
      <Image
        src = "/logo.png"
        alt = "FrameGuesser Logo"
        width = {600}
        height = {600}
        priority
      />

      <h1 className = "text-7xl font-karnak-condensed-black">FrameGuesser</h1>

      <h3 className = "text-3xl mt-5 mb-15 font-karnak-light tracking-wide">
        {translations("subtitle")}
      </h3>

      {isLoggedIn && <ProfileDropdown user = {userProfile} />}

      <div className = "grid grid-cols-2 grid-rows-2 gap-10">
        <AnimatedLinkButton
          href = "https://github.com/christian-ms13/frame-guesser"
          target = "_blank"
          icon = {<IconCode className = "w-full h-full" />}
          text = "GitHub"
          bgGif = "/home-page/code-bg.gif"
          linkStyle = {linkStyle}
        />

        <Link
          href = {isLoggedIn ? "/play" : "/login"}
          className = {`${linkStyle} font-play-bold bg-[#121212] text-[#e3e3e1] dark:bg-[#e3e3e1] dark:text-[#121212]`}
        >
          <IconPlay className = "w-6 h-6" />
          <span>{translations("play")}</span>
        </Link>

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
    </>
  )
}
