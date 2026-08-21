"use client"

import { useState } from "react"

type Plan = "monthly" | "yearly"

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout(plan: Plan) {
    setLoadingPlan(plan)
    setError(null)

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      })

      const data = (await response.json()) as {
        success?: boolean
        url?: string
        error?: string
      }

      if (!response.ok || !data.url) {
        setError(data.error ?? "CHECKOUT_FAILED")
        return
      }

      window.location.href = data.url
    } catch {
      setError("CHECKOUT_FAILED")
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink-900">
          ScoreL1 Premium
        </h1>

        <p className="mt-3 text-ink-600">
          Accède aux pronostics premium et aux analyses détaillées.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-xl font-semibold text-ink-900">Mensuel</h2>

          <p className="mt-4 font-display text-4xl font-bold text-ink-900">
            6,99 €
          </p>

          <p className="mt-1 text-sm text-ink-500">par mois</p>

          <button
            type="button"
            onClick={() => handleCheckout("monthly")}
            disabled={loadingPlan !== null}
            className="mt-6 w-full rounded-xl bg-ink-900 px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            {loadingPlan === "monthly"
              ? "Redirection..."
              : "Choisir le mensuel"}
          </button>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-xl font-semibold text-ink-900">Annuel</h2>

          <p className="mt-4 font-display text-4xl font-bold text-ink-900">
            59,99 €
          </p>

          <p className="mt-1 text-sm text-ink-500">par an</p>

          <button
            type="button"
            onClick={() => handleCheckout("yearly")}
            disabled={loadingPlan !== null}
            className="mt-6 w-full rounded-xl bg-ink-900 px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            {loadingPlan === "yearly" ? "Redirection..." : "Choisir l’annuel"}
          </button>
        </section>
      </div>

      {error && (
        <p className="mt-6 text-center text-sm text-red-600">
          Erreur : {error}
        </p>
      )}
    </main>
  )
}
