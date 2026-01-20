"use client"

import Link from "next/link"
import { useState } from "react"

interface AnimatedLinkButtonProps {
  href: string
  icon: React.ReactNode
  text: string
  bgGif: string
  linkStyle: string
  target?: string
}

export default function AnimatedLinkButton({
  href,
  icon,
  text,
  bgGif,
  linkStyle,
  target
}: AnimatedLinkButtonProps) {
  const [gifUrl, setGifUrl] = useState(bgGif)

  const handleMouseEnter = () => {
    setGifUrl(`${bgGif}?t=${Date.now()}`)
  }

  return (
    <Link
      href = {href}
      target = {target}
      className = {`${linkStyle} font-googlesanscode-light border-2 border-[#121212] dark:border-[#e3e3e1] relative overflow-hidden group`}
      onMouseEnter = {handleMouseEnter}
    >
      <div 
        className = "absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-100 transition-opacity duration-350 z-0"
        style = {{ backgroundImage: `url('${gifUrl}')` }}
      />
      <div className = "absolute inset-0 bg-black/47 opacity-0 group-hover:opacity-100 transition-opacity duration-350 z-0" />
      <div className = "w-6 h-6 relative z-10 group-hover:text-[#e3e3e1] duration-50">
        {icon}
      </div>
      <span className = "relative z-10 group-hover:text-[#e3e3e1] duration-50">{text}</span>
    </Link>
  )
}
