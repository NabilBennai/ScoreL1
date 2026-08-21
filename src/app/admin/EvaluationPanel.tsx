"use client"

import { useEffect, useState } from "react"

type StrategyMetrics = {
  exactScores: number
  correctOutcomes: number
  totalPoints: number
}

type EvaluationResponse = {
  success: boolean
  matchesEvaluated: number
  leader: StrategyMetrics
  balanced: StrategyMetrics
  challenger: StrategyMetrics
  error?: string
}

function percentage(value: number, total: number): string {
  if (total === 0) {
    return "0 %"
  }

  return `${((value / total) * 100).toFixed(1)} %`
}

function average(value: number, total: number): string {
  if (total === 0) {
    return "0.0"
  }

  return (value / total).toFixed(1)
}

function StrategyCard({
  title,
  metrics,
  total,
}: {
  title: string
  metrics: StrategyMetrics
  total: number
}) {
  return (
    <div className="data-card rounded-xl border p-5">
      <h3 className="text-lg font-semibold">{title}</h3>

      <div className="mt-4 space-y-5">
        <div>
          <p className="text-sm text-zinc-500">Points MPP</p>

          <p className="mt-1 text-2xl font-bold">{metrics.totalPoints}</p>

          <p className="text-sm text-zinc-500">
            {average(metrics.totalPoints, total)} pts / match
          </p>
        </div>

        <div>
          <p className="text-sm text-zinc-500">Scores exacts</p>

          <p className="mt-1 text-2xl font-bold">
            {metrics.exactScores}/{total}
          </p>

          <p className="text-sm text-zinc-500">
            {percentage(metrics.exactScores, total)}
          </p>
        </div>

        <div>
          <p className="text-sm text-zinc-500">Bons résultats 1N2</p>

          <p className="mt-1 text-2xl font-bold">
            {metrics.correctOutcomes}/{total}
          </p>

          <p className="text-sm text-zinc-500">
            {percentage(metrics.correctOutcomes, total)}
          </p>
        </div>
      </div>
    </div>
  )
}

function getBestStrategy(data: EvaluationResponse): string | null {
  if (data.matchesEvaluated === 0) {
    return null
  }

  const strategies = [
    {
      name: "Leader",
      points: data.leader.totalPoints,
    },
    {
      name: "Équilibré",
      points: data.balanced.totalPoints,
    },
    {
      name: "Challenger",
      points: data.challenger.totalPoints,
    },
  ]

  strategies.sort((a, b) => b.points - a.points)

  return strategies[0].name
}

export default function EvaluationPanel() {
  const [data, setData] = useState<EvaluationResponse | null>(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadEvaluation() {
      try {
        const response = await fetch("/api/admin/evaluation", {
          cache: "no-store",
        })

        const payload = (await response.json()) as EvaluationResponse

        if (!response.ok || !payload.success) {
          throw new Error(payload.error ?? "EVALUATION_FAILED")
        }

        setData(payload)
      } catch (loadError) {
        console.error(loadError)

        setError("Impossible de charger l'évaluation.")
      } finally {
        setLoading(false)
      }
    }

    void loadEvaluation()
  }, [])

  if (loading) {
    return (
      <section className="rounded-xl border p-6">
        <p className="text-sm text-zinc-500">
          Chargement de l`&lsquo;évaluation...
        </p>
      </section>
    )
  }

  if (error || !data) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">
          {error ?? "Évaluation indisponible."}
        </p>
      </section>
    )
  }

  const bestStrategy = getBestStrategy(data)

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Évaluation du modèle</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Performance sur les matchs terminés disposant d`&lsquo;une
            prédiction.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="rounded-lg bg-zinc-100 px-4 py-3">
            <p className="text-xs text-zinc-500">Matchs évalués</p>

            <p className="text-xl font-semibold">{data.matchesEvaluated}</p>
          </div>

          {bestStrategy && (
            <div className="rounded-lg bg-zinc-900 px-4 py-3 text-white">
              <p className="text-xs text-zinc-300">Meilleure stratégie</p>

              <p className="text-xl font-semibold">{bestStrategy}</p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Les points affichés utilisent actuellement les règles DEV MPP.
      </p>

      {data.matchesEvaluated === 0 ? (
        <div className="mt-5 rounded-xl border p-6">
          <p className="text-sm text-zinc-500">
            Aucun match terminé n`&lsquo;est encore disponible pour évaluer le
            modèle.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <StrategyCard
            title="Leader"
            metrics={data.leader}
            total={data.matchesEvaluated}
          />

          <StrategyCard
            title="Équilibré"
            metrics={data.balanced}
            total={data.matchesEvaluated}
          />

          <StrategyCard
            title="Challenger"
            metrics={data.challenger}
            total={data.matchesEvaluated}
          />
        </div>
      )}
    </section>
  )
}
