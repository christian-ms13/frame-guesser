"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef, useState } from "react"

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
  const [isHovered, setIsHovered] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleMouseEnter = () => {
    setIsHovered(true)
    // Force GIF to restart from beginning
    if (imgRef.current) {
      const currentSrc = imgRef.current.src
      imgRef.current.src = ""
      imgRef.current.src = currentSrc
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <Link
      href = {href}
      target = {target}
      className = {`${linkStyle} font-googlesanscode-light border-2 border-[#121212] dark:border-[#e3e3e1] relative overflow-hidden group`}
      onMouseEnter = {handleMouseEnter}
      onMouseLeave = {handleMouseLeave}
    >
      <div className = {`absolute inset-0 transition-opacity duration-350 z-0 ${isHovered ? "opacity-100" : "opacity-0"}`}>
        <Image
          ref = {imgRef}
          src = {bgGif}
          alt = ""
          fill
          className = "object-cover"
          unoptimized
        />
      </div>
      <div className = {`absolute inset-0 bg-black/47 transition-opacity duration-350 z-0 ${isHovered ? "opacity-100" : "opacity-0"}`} />
      <div className = "w-6 h-6 relative z-10 group-hover:text-[#e3e3e1] duration-50">
        {icon}
      </div>
      <span className = "relative z-10 group-hover:text-[#e3e3e1] duration-50">{text}</span>
    </Link>
  )
}
