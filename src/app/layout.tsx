import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "FrameGuesser | Test Your Movie Knowledge",
  description: "A cinematographic puzzle game where users guess movies from obscured frames. Built with Next.js, Tailwind CSS, and the TMDB API."
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang = "en">
      <body>
        {children}
      </body>
    </html>
  )
}
