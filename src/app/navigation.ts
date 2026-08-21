import type { AccessLevel } from "@/lib/data/supabase/access"

export type NavigationItem = {
  href: string
  label: string
}

export function getNavigationItems(accessLevel: AccessLevel): NavigationItem[] {
  if (accessLevel === "admin") {
    return [
      { href: "/", label: "Pronostics" },
      { href: "/admin", label: "Administration" },
    ]
  }

  if (accessLevel === "subscriber") {
    return [{ href: "/", label: "Pronostics" }]
  }

  return []
}
