import { createSupabaseAuthServerClient } from "./auth-server"

export type UserRole = "admin" | "user"
export type SubscriptionStatus = "active" | "inactive"

export type UserProfile = {
  user_id: string
  role: UserRole
  subscription_status: SubscriptionStatus
  created_at: string
  updated_at: string
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createSupabaseAuthServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, role, subscription_status, created_at, updated_at")
    .eq("user_id", user.id)
    .single()

  if (error) {
    return null
  }

  return data as UserProfile
}
