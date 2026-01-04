import { useTheme } from "next-themes"

export default function GetCurrentTheme(): "light" | "dark" {
  const { theme } = useTheme()
  const currentTheme = 
    theme === "light" ? "light" :
    theme === "dark" ? "dark" :
    theme === "system" ? 
      (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
    : theme === "routine" ?
      (() => {
        const hour = new Date().getHours()
        return hour >= 7 && hour < 19 ? "light" : "dark"
      })()
    : "light"

  return currentTheme
}
