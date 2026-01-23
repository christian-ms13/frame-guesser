import { createServerClient } from "@supabase/ssr"
import createMiddleware from "next-intl/middleware"
import { type NextRequest } from "next/server"

export default async function proxy(request: NextRequest) {
  const storedLocale = request.cookies.get("NEXT_LOCALE")?.value
  const defaultLocale = (storedLocale && ["en", "es"].includes(storedLocale)) ? (storedLocale as "en" | "es") : "en"

  const handleI18n = createMiddleware({
    locales: ["en", "es"],
    defaultLocale: defaultLocale
  })

  const response = handleI18n(request)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
}
