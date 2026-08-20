import { NextResponse } from "next/server"

import { createSupabaseAuthServerClient } from "@/lib/data/supabase/auth-server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createSupabaseAuthServerClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL("/", requestUrl.origin))
}
