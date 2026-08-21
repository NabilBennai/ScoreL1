import { createSupabaseAuthServerClient } from "./auth-server"

export type AdminAuthorization =
  | {
      authorized: true
    }
  | {
      authorized: false
      status: 401 | 403
    }

export async function authorizeAdmin(): Promise<AdminAuthorization> {
  const supabase = await createSupabaseAuthServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      authorized: false,
      status: 401,
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (profileError || profile?.role !== "admin") {
    return {
      authorized: false,
      status: 403,
    }
  }

  return {
    authorized: true,
  }
}
