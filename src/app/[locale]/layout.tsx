import type { Metadata } from "next"
import localFont from "next/font/local"

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang = "en" suppressHydrationWarning>
      <body className = {`${karnakLight.variable} ${karnakCondensedBlack.variable} antialiased`}>
        <ThemeProvider
          attribute = "class"
          defaultTheme = "system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
