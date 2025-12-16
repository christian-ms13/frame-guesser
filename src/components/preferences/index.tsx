import { IconUS, IconES } from "./LanguageIcons"
import { IconDark, IconLight } from "./ThemeIcons"

type PreferencesIndexProps = {
  className?: string
}

export default function PreferencesIndex({ className }: PreferencesIndexProps) {
  return (
    <div className = {`flex gap-7 ${className}`}>
      <div className = "flex gap-3">
        <IconDark className = "w-6 h-6" />
        <IconLight className = "w-6 h-6" />
      </div>

      <div className = "flex gap-3">
        <IconUS className = "w-7 h-7" />
        <IconES className = "w-7 h-7" />
      </div>
    </div>
  )
}
