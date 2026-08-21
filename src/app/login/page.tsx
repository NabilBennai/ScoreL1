"use client"

import { useState } from "react"

import { supabaseClient } from "@/lib/data/supabase/client"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleGoogleLogin() {
    setIsLoading(true)
    setErrorMessage(null)

    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error("Google login failed", error)
      setErrorMessage("La connexion a échoué. Réessaie dans quelques instants.")
      setIsLoading(false)
    }
  }

  return (
    <main className="login-pitch relative flex flex-1 items-center overflow-hidden px-5 py-12 sm:px-8 sm:py-16">
      <div className="login-field-lines" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/15 bg-pitch-950/80 shadow-2xl shadow-pitch-950/30 backdrop-blur-sm lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden min-h-[34rem] overflow-hidden border-r border-white/10 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-pitch-300">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400 shadow-[0_0_0_4px_rgba(240,196,84,.14)]" />
              Espace joueurs
            </div>

            <h1 className="mt-8 max-w-md font-display text-6xl font-bold uppercase leading-[0.92] tracking-[-0.02em]">
              Entre sur
              <br />
              <span className="text-pitch-300">le terrain.</span>
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-cream-100/75">
              Retrouve tes pronostics Ligue 1 et prépare chaque journée avec les
              scores proposés par le modèle.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            <span className="h-px w-10 bg-gold-400" />
            Analyse · Probabilités · Score exact
          </div>
        </section>

        <section className="flex flex-col justify-center bg-cream-50 px-6 py-10 sm:px-10 sm:py-14 lg:px-12">
          <div className="lg:hidden">
            <span className="inline-flex items-center gap-2 rounded-full bg-pitch-950 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-pitch-300">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
              Espace joueurs
            </span>
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-pitch-600 lg:mt-0">
            MPP Scores
          </p>
          <h2 className="mt-2 font-display text-4xl font-bold uppercase leading-none text-ink-900 sm:text-5xl">
            Connexion
          </h2>
          <p className="mt-4 text-sm leading-6 text-ink-600">
            Connecte-toi avec ton compte Google pour accéder à ton espace.
          </p>

          <div className="my-8 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            <span className="h-2 w-2 rounded-full bg-pitch-500" />
            <span className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="group flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-white px-4 py-3.5 text-sm font-bold text-ink-900 shadow-sm transition hover:-translate-y-0.5 hover:border-pitch-500 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-600 disabled:cursor-wait disabled:opacity-65"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-cream-100 font-bold text-pitch-800 transition group-hover:bg-pitch-800 group-hover:text-white">
              G
            </span>
            {isLoading ? "Connexion en cours…" : "Continuer avec Google"}
          </button>

          {errorMessage && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {errorMessage}
            </p>
          )}

          <p className="mt-6 text-center text-xs leading-5 text-ink-400">
            Une seule connexion, tous tes pronostics à portée de main.
          </p>
        </section>
      </div>
    </main>
  )
}
