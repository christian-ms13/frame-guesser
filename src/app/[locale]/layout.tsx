import type { Metadata } from "next"
import localFont from "next/font/local"
import { getMessages } from "next-intl/server"
import { NextIntlClientProvider } from "next-intl"
import { Analytics } from "@vercel/analytics/next"

import { ThemeProvider } from "@/components/ThemeProvider"

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
      <body className = {`${karnakLight.variable} ${karnakCondensedBlack.variable} antialiased`}>
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
