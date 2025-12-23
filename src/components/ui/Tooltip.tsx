type TooltipProps = {
  children: React.ReactNode
  text: string
  active?: boolean
}

export default function Tooltip({ children, text, active = true }: TooltipProps): React.ReactNode {
  return (
    <div className = "group relative flex items-center justify-center">
      {children}

      {active && (
        <span className = "absolute bottom-full mb-2.5 hidden sm:flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all duration-75 delay-400 ease-out transform translate-y-1 group-hover:translate-y-0 pointer-events-none z-50">
          <span className = "relative z-10 bg-[#1f1f1f] dark:bg-[#e0e0e0] text-[#e0e0e0] dark:text-[#1f1f1f] text-xs font-medium py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap border border-white/10 dark:border-black/5">
            {text}
          </span>
          <span className = "w-0 h-0 -mt-px border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#1f1f1f] dark:border-t-[#e0e0e0]" />
        </span>
      )}
    </div>
  )
}
