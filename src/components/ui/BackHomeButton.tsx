import { useTranslations } from "next-intl"
import Link from "next/link"

import IconGoBack from "../login-page/GoBackIcon"

export default function BackHomeButton() {
  const translations = useTranslations("loginPage")

  return (
    <Link
      href = "/"
      className = "w-max fixed top-5 left-0 ml-5 z-50 flex items-center justify-start gap-2 font-medium text-white bg-red-500 px-6 py-3 rounded-full text-lg hover:scale-110 transition-all duration-100 active:scale-100 hover:shadow-lg shadow-red-500/50" // two or more transitions with different durations: {animation-itself} {animation2-itself} transition-[animation,animation2] duration-[duration+metric,duration2+metric]
    >
      <IconGoBack />
      <span>{translations("backHome")}</span>
    </Link>
  )
}
