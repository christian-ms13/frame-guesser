"use client"

import React, { useEffect, useRef, useState } from "react"

type TruncatedTooltipProps = {
  children: React.ReactNode
  text: string
}

export default function TruncatedTooltip({ children, text }: TruncatedTooltipProps): React.ReactNode {
  const [isTruncated, setIsTruncated] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const checkTruncation = () => {
      if (elementRef.current) {
        setIsTruncated(elementRef.current.scrollWidth > elementRef.current.clientWidth)
      }
    }

    checkTruncation()
    window.addEventListener('resize', checkTruncation)
    return () => window.removeEventListener('resize', checkTruncation)
  }, [text])

  if (!React.isValidElement(children)) {
    return children
  }

  return (
    <div className="group relative inline-block">
      {React.cloneElement(children, {
        ref: elementRef,
      } as any)}
      {isTruncated && (
        <span className="absolute bottom-full mb-2.5 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all duration-75 delay-400 ease-out transform translate-y-1 group-hover:translate-y-0 pointer-events-none z-50 left-1/2 -translate-x-1/2">
          <span className="relative z-10 bg-[#1f1f1f] dark:bg-[#e0e0e0] text-[#e0e0e0] dark:text-[#1f1f1f] text-xs font-medium py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap border border-white/10 dark:border-black/5">
            {text}
          </span>
          <span className="w-0 h-0 -mt-px border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#1f1f1f] dark:border-t-[#e0e0e0]" />
        </span>
      )}
    </div>
  )
}
