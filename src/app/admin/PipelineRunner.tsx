"use client"

import { useState } from "react"

type PipelineResponse = {
  success: boolean
  durationMs?: number
  error?: string

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
    unmatched: Array<{
      matchId: string
      homeSlug: string | null
      awaySlug: string | null
    }>
  }

  predictions?: {
    matchesFound: number
    calculated: number
    failed: number
  }
}

export default function PipelineRunner() {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<PipelineResponse | null>(null)

  async function runPipeline() {
    setRunning(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/run-pipeline", {
        method: "POST",
      })

      const payload = (await response.json()) as PipelineResponse

      setResult(payload)
    } catch (error) {
      console.error(error)

      setResult({
        success: false,
        error: "NETWORK_ERROR",
      })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        disabled={running}
        onClick={runPipeline}
        className="rounded-lg bg-zinc-900 px-5 py-3 font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {running ? "Synchronisation en cours..." : "Synchroniser et recalculer"}
      </button>

      {result && (
        <div className="mt-8">
          {!result.success ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="font-medium text-red-700">Le pipeline a échoué.</p>

              {result.error && (
                <p className="mt-2 text-sm text-red-600">{result.error}</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-xl border p-5">
                <p className="text-sm text-zinc-500">Durée totale</p>

                <p className="mt-1 text-2xl font-semibold">
                  {result.durationMs
                    ? `${(result.durationMs / 1000).toFixed(2)} s`
                    : "—"}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border p-5">
                  <p className="text-sm font-medium">Synchronisation</p>

                  <div className="mt-4 space-y-1 text-sm text-zinc-600">
                    <p>Lignes provider : {result.sync?.providerRows ?? 0}</p>

                    <p>Événements : {result.sync?.eventsSeen ?? 0}</p>

                    <p>Fixtures : {result.sync?.fixturesSynced ?? 0}</p>

                    <p>
                      Snapshots créés : {result.sync?.snapshotsCreated ?? 0}
                    </p>

                    <p>
                      Snapshots réutilisés : {result.sync?.snapshotsReused ?? 0}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border p-5">
                  <p className="text-sm font-medium">Journées</p>

                  <div className="mt-4 space-y-1 text-sm text-zinc-600">
                    <p>Matchs trouvés : {result.rounds?.matchesFound ?? 0}</p>

                    <p>Matchés : {result.rounds?.matched ?? 0}</p>

                    <p>Mis à jour : {result.rounds?.updated ?? 0}</p>

                    <p>Inchangés : {result.rounds?.unchanged ?? 0}</p>
                  </div>
                </div>

                <div className="rounded-xl border p-5">
                  <p className="text-sm font-medium">Prédictions</p>

                  <div className="mt-4 space-y-1 text-sm text-zinc-600">
                    <p>Matchs : {result.predictions?.matchesFound ?? 0}</p>

                    <p>Calculées : {result.predictions?.calculated ?? 0}</p>

                    <p>Échecs : {result.predictions?.failed ?? 0}</p>
                  </div>
                </div>
              </div>

              {(result.sync?.unmappedTeams.length ?? 0) > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <p className="font-medium text-amber-800">
                    Équipes non reconnues
                  </p>

                  <ul className="mt-3 list-disc pl-5 text-sm text-amber-700">
                    {result.sync?.unmappedTeams.map((team) => (
                      <li key={team}>{team}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
