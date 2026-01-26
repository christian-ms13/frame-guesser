"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { useState } from "react"

import { IconPlay } from "./actions/LinkIcons"

interface PlayButtonProps {
  href: string
  linkStyle: string
}

export default function PlayButton({ href, linkStyle }: PlayButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const translations = useTranslations("homePage")

  return (
    <Link
      href = {href}
      onClick = {() => setIsLoading(true)}
      className = {`${linkStyle} font-play-bold bg-[#121212] text-[#e3e3e1] dark:bg-[#e3e3e1] dark:text-[#121212]`}
    >
      {isLoading ? (
        <div className = "animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
      ) : (
        <>
          <IconPlay className = "w-6 h-6" />
          <span>{translations("play")}</span>
        </>
      )}
    </Link>
  )
}
