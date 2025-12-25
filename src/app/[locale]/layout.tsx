import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import localFont from "next/font/local"

import { ThemeProvider } from "../../components/preferences/ThemeProvider"

import "../globals.css"

export const metadata: Metadata = {
  title: "FrameGuesser • Test Your Movie Knowledge",
  description: "A cinematographic puzzle game where users guess movies from obscured frames. Built with Next.js, Tailwind CSS, and the TMDB API."
}

const karnakLight = localFont({
  src: "../fonts/karnak-light.woff2",
  variable: "--font-karnak-light",
  display: "swap"
})

const karnakCondensedBlack = localFont({
  src: "../fonts/karnak-condensed-black.woff2",
  variable: "--font-karnak-condensed-black",
  display: "swap"
})

const googleSansCodeLight = localFont({
  src: "../fonts/googlesanscode-light.woff2",
  variable: "--font-googlesanscode-light",
  display: "swap"
})

const playBold = localFont({
  src: "../fonts/play-bold.woff2",
  variable: "--font-play-bold",
  display: "swap"
})

const fontsToPreload = [
  karnakLight,
  karnakCondensedBlack,
  googleSansCodeLight,
  playBold
]

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang = {locale} suppressHydrationWarning>
      <body className = {`${fontsToPreload.map(font => font.variable).join(" ")} antialiased cursor-default select-none bg-[#e3e3e1] text-[#121212] dark:bg-[#121212] dark:text-[#e3e3e1]`}>
        <NextIntlClientProvider messages = {messages}>
          <ThemeProvider
            attribute = "class"
            defaultTheme = "system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Analytics />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
