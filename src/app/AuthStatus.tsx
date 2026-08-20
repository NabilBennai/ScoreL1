"use client"

import { useEffect, useState } from "react"

import { supabaseClient } from "@/lib/data/supabase/client"

type AuthUser = {
  email: string | null
}

export default function AuthStatus() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      setUser({
        email: data.user?.email ?? null,
      })
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(
        session?.user
          ? {
              email: session.user.email ?? null,
            }
          : null,
      )
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    await supabaseClient.auth.signOut()
    window.location.href = "/"
  }

  if (loading) {
    return null
  }

  if (!user) {
    return (
      <a href="/login" className="text-sm font-medium">
        Se connecter
      </a>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-neutral-600">{user.email}</span>

      <button
        type="button"
        onClick={handleLogout}
        className="text-sm font-medium"
      >
        Déconnexion
      </button>
    </div>
  )
}
