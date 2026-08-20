import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase public environment variables")
  }

  return { url, key }
}

export async function createSupabaseAuthServerClient() {
  const { url, key } = getSupabasePublicConfig()
  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Server Components cannot write cookies.
          // The proxy handles session refresh.
        }
      },
    },
  })
}
