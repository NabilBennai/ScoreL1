import { getCurrentUserProfile } from "./profile"

export type AccessLevel = "anonymous" | "user" | "subscriber" | "admin"

export async function getCurrentAccessLevel(): Promise<AccessLevel> {
  const profile = await getCurrentUserProfile()

  if (!profile) {
    return "anonymous"
  }

  if (profile.role === "admin") {
    return "admin"
  }

  if (profile.subscription_status === "active") {
    return "subscriber"
  }

  return "user"
}
