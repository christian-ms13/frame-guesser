import { IconDark, IconLight } from "./ThemeIcons"
import { IconUS, IconES } from "./LanguageIcons"

type PreferencesIndexProps = {
  className?: string
}

export default function PreferencesIndex({ className }: PreferencesIndexProps) {
  return (
    <div className = {`flex gap-5 justify-between items-center ${className}`}>
      <div className = "flex gap-3">
        <IconDark className = "w-6 h-6 cursor-pointer" />
        <IconLight className = "w-6 h-6 cursor-pointer" />
      </div>

      <span>|</span>

      <div className = "flex gap-3">
        <IconUS className = "w-7 h-7 cursor-pointer" />
        <IconES className = "w-7 h-7 cursor-pointer" />
      </div>
    </div>
  )
}
