"use client"

import { useState } from "react"

type PipelineResult = {
  success: boolean
  durationMs: number

  sync?: {
    providerRows: number
    eventsSeen: number
    fixturesSynced: number
    snapshotsCreated: number
    snapshotsReused: number
    skippedRows: number
    unmappedTeams: string[]
  }

  rounds?: {
    matchesFound: number
    matched: number
    updated: number
    unchanged: number
  }

  predictions?: {
    matchesFound: number
    calculated: number
    reused: number
    failed: number
  }

  results?: {
    providerEvents: number
    completedEvents: number
    updatedMatches: number
    unchangedMatches: number
    missingMatches: number
    incompleteScores: number
  }

  error?: string
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="data-card rounded-lg bg-zinc-100 p-4">
      <p className="text-xs text-zinc-500">{label}</p>

      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  )
}

export default function PipelineRunner() {
  const [running, setRunning] = useState(false)

  const [result, setResult] = useState<PipelineResult | null>(null)

  const [error, setError] = useState<string | null>(null)

  async function runPipeline() {
    setRunning(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/run-pipeline", {
        method: "POST",
      })

      const payload = (await response.json()) as PipelineResult

      setResult(payload)

      if (!response.ok || !payload.success) {
        setError(payload.error ?? "Le pipeline a échoué.")
      }
    } catch (runError) {
      console.error(runError)

      setError("Impossible de lancer le pipeline.")
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={runPipeline}
        disabled={running}
        className="premium-button rounded-lg bg-zinc-900 px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {running ? "Pipeline en cours..." : "Lancer le pipeline"}
      </button>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result?.success && (
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold">Exécution</h2>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                label="Durée"
                value={`${(result.durationMs / 1000).toFixed(2)} s`}
              />
            </div>
          </section>

          {result.sync && (
            <section>
              <h2 className="text-lg font-semibold">Synchronisation</h2>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Stat
                  label="Lignes provider"
                  value={result.sync.providerRows}
                />

                <Stat label="Événements" value={result.sync.eventsSeen} />

                <Stat label="Fixtures" value={result.sync.fixturesSynced} />

                <Stat
                  label="Snapshots créés"
                  value={result.sync.snapshotsCreated}
                />

                <Stat
                  label="Snapshots réutilisés"
                  value={result.sync.snapshotsReused}
                />
              </div>

              {result.sync.unmappedTeams.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Équipes non mappées : {result.sync.unmappedTeams.join(", ")}
                </div>
              )}
            </section>
          )}

          {result.rounds && (
            <section>
              <h2 className="text-lg font-semibold">Journées</h2>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat
                  label="Matchs trouvés"
                  value={result.rounds.matchesFound}
                />

                <Stat label="Matchés" value={result.rounds.matched} />

                <Stat label="Mis à jour" value={result.rounds.updated} />

                <Stat label="Inchangés" value={result.rounds.unchanged} />
              </div>
            </section>
          )}

          {result.predictions && (
            <section>
              <h2 className="text-lg font-semibold">Prédictions</h2>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Matchs" value={result.predictions.matchesFound} />

                <Stat label="Calculées" value={result.predictions.calculated} />

                <Stat label="Réutilisées" value={result.predictions.reused} />

                <Stat label="Échecs" value={result.predictions.failed} />
              </div>
            </section>
          )}

          {result.results && (
            <section>
              <h2 className="text-lg font-semibold">Résultats</h2>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <Stat
                  label="Événements provider"
                  value={result.results.providerEvents}
                />

                <Stat label="Terminés" value={result.results.completedEvents} />

                <Stat
                  label="Mis à jour"
                  value={result.results.updatedMatches}
                />

                <Stat
                  label="Inchangés"
                  value={result.results.unchangedMatches}
                />

                <Stat
                  label="Matchs inconnus"
                  value={result.results.missingMatches}
                />

                <Stat
                  label="Scores incomplets"
                  value={result.results.incompleteScores}
                />
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
