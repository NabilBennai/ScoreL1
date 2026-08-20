"use client"

import { supabaseClient } from "@/lib/data/supabase/client"

export default function LoginPage() {
  async function handleGoogleLogin() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error("Google login failed", error)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border p-8">
        <h1 className="text-2xl font-semibold">Connexion</h1>

        <p className="mt-3 text-sm text-neutral-600">
          Connecte-toi pour accéder à ScoreL1.
        </p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-6 w-full rounded-xl border px-4 py-3 font-medium"
        >
          Continuer avec Google
        </button>
      </div>
    </main>
  )
}
