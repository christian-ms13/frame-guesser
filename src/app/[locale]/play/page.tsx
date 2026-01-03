import { redirect } from "next/navigation"
import { createClient } from "../../../utils/supabase/server"

export default async function GamePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { locale } = await params

  if (!user) {
    redirect(`/${locale}/login`)
  }

  return <div>test</div>
}
