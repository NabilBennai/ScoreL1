"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { supabaseClient } from "@/lib/data/supabase/client"

type AuthUser = {
  email: string | null
}

export default function AuthStatus() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let authStateChanged = false

    void supabaseClient.auth.getUser().then(({ data, error }) => {
      if (!authStateChanged) {
        setUser(
          !error && data.user
            ? {
                email: data.user.email ?? null,
              }
            : null,
        )
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event !== "INITIAL_SESSION") {
        authStateChanged = true
      }

      setUser(
        session?.user
          ? {
              email: session.user.email ?? null,
            }
          : null,
      )
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    await supabaseClient.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return null
  }

  if (!user) {
    return (
      <a href="/login" className="auth-login-button">
        <span className="auth-user-icon" aria-hidden="true" />
        Se connecter
      </a>
    )
  }

  return (
    <div className="auth-profile">
      <span className="auth-user-icon" aria-hidden="true" />
      <span className="auth-email" title={user.email ?? "Profil connecté"}>
        {user.email ?? "Profil"}
      </span>

      <button
        type="button"
        onClick={handleLogout}
        className="auth-logout-button"
      >
        <span className="hidden sm:inline">Déconnexion</span>
        <span className="sm:hidden">Quitter</span>
      </button>
    </div>
  )
}
