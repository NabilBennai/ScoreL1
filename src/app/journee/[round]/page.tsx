import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { getRoundMatches } from "@/lib/data/repositories/round-repository"
import { getCurrentAccessLevel } from "@/lib/data/supabase/access"
import {
  buildMarketConsensus,
  type BookmakerMarket,
} from "@/lib/model/market-consensus"

type PageProps = {
  params: Promise<{
    round: string
  }>
}

type Team = {
  id: string
  name: string
  short_name: string | null
}

type MarketPayload = {
  oneXTwo?: {
    home: number
    draw: number
    away: number
  } | null

  over25?: {
    over: number
    under: number
  } | null

  btts?: {
    yes: number
    no: number
  } | null
}

type Prediction = {
  id: string
  calculated_at: string
  cutoff_at: string
  odds_snapshot_id: string
  leader_score: string | null
  balanced_score: string | null
}

type OddsSnapshot = {
  id: string
  bookmaker: string | null
  captured_at: string
  provider: string
  market_payload: MarketPayload
}

type PredictionStatus = "UP_TO_DATE" | "CONSENSUS_CHANGED" | "UNKNOWN"

function getSingleTeam(value: Team | Team[] | null): Team | null {
  if (!value) {
    return null
  }

  return Array.isArray(value) ? (value[0] ?? null) : value
}

function getLatestPrediction(
  predictions: Prediction[] | null,
): Prediction | null {
  if (!predictions || predictions.length === 0) {
    return null
  }

  return [...predictions].sort(
    (a, b) =>
      new Date(b.calculated_at).getTime() - new Date(a.calculated_at).getTime(),
  )[0]
}

function getRawBookmakerSnapshots(
  snapshots: OddsSnapshot[] | null,
): OddsSnapshot[] {
  return (snapshots ?? []).filter(
    (snapshot) =>
      snapshot.provider === "the-odds-api" && snapshot.bookmaker !== null,
  )
}

function getLatestSnapshotsByBookmaker(
  snapshots: OddsSnapshot[] | null,
): OddsSnapshot[] {
  const rawSnapshots = getRawBookmakerSnapshots(snapshots)

  const latest = new Map<string, OddsSnapshot>()

  const sorted = [...rawSnapshots].sort(
    (a, b) =>
      new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime(),
  )

  for (const snapshot of sorted) {
    if (!snapshot.bookmaker) {
      continue
    }

    if (!latest.has(snapshot.bookmaker)) {
      latest.set(snapshot.bookmaker, snapshot)
    }
  }

  return [...latest.values()]
}

function getRawBookmakerCount(snapshots: OddsSnapshot[] | null): number {
  return getLatestSnapshotsByBookmaker(snapshots).length
}

function getLatestRawOddsAt(snapshots: OddsSnapshot[] | null): string | null {
  const rawSnapshots = getRawBookmakerSnapshots(snapshots)

  if (rawSnapshots.length === 0) {
    return null
  }

  return [...rawSnapshots].sort(
    (a, b) =>
      new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime(),
  )[0].captured_at
}

function buildCurrentConsensus(
  snapshots: OddsSnapshot[] | null,
): MarketPayload | null {
  const latestSnapshots = getLatestSnapshotsByBookmaker(snapshots)

  const markets: BookmakerMarket[] = latestSnapshots.map((snapshot) => ({
    bookmaker: snapshot.bookmaker ?? "unknown",
    oneXTwo: snapshot.market_payload.oneXTwo ?? undefined,
    over25: snapshot.market_payload.over25 ?? undefined,
    btts: snapshot.market_payload.btts ?? undefined,
  }))

  if (markets.length === 0) {
    return null
  }

  try {
    const consensus = buildMarketConsensus(markets)

    return {
      oneXTwo: consensus.oneXTwo,
      over25: consensus.over25,
      btts: consensus.btts,
    }
  } catch {
    return null
  }
}

function normalizeMarketPayload(payload: MarketPayload) {
  return {
    oneXTwo: payload.oneXTwo
      ? {
          home: payload.oneXTwo.home,
          draw: payload.oneXTwo.draw,
          away: payload.oneXTwo.away,
        }
      : null,

    over25: payload.over25
      ? {
          over: payload.over25.over,
          under: payload.over25.under,
        }
      : null,

    btts: payload.btts
      ? {
          yes: payload.btts.yes,
          no: payload.btts.no,
        }
      : null,
  }
}

function sameMarketPayload(a: MarketPayload, b: MarketPayload): boolean {
  return (
    JSON.stringify(normalizeMarketPayload(a)) ===
    JSON.stringify(normalizeMarketPayload(b))
  )
}

function getPredictionStatus(
  prediction: Prediction,
  snapshots: OddsSnapshot[] | null,
): PredictionStatus {
  const predictionSnapshot = (snapshots ?? []).find(
    (snapshot) => snapshot.id === prediction.odds_snapshot_id,
  )

  if (!predictionSnapshot) {
    return "UNKNOWN"
  }

  const currentConsensus = buildCurrentConsensus(snapshots)

  if (!currentConsensus) {
    return "UNKNOWN"
  }

  return sameMarketPayload(predictionSnapshot.market_payload, currentConsensus)
    ? "UP_TO_DATE"
    : "CONSENSUS_CHANGED"
}

function formatKickoff(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatFreshness(value: string): string {
  const timestamp = new Date(value).getTime()

  const now = Date.now()

  const diffMinutes = Math.max(0, Math.floor((now - timestamp) / 60_000))

  if (diffMinutes < 1) {
    return "à l'instant"
  }

  if (diffMinutes < 60) {
    return `il y a ${diffMinutes} min`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) {
    return `il y a ${diffHours} h`
  }

  const diffDays = Math.floor(diffHours / 24)

  return `il y a ${diffDays} j`
}

function PredictionScore({
  label,
  score,
}: {
  label: string
  score: string | null
}) {
  return (
    <div className="scoreboard-chip">
      <p className="scoreboard-label text-[0.65rem]">{label}</p>
      <p className="scoreboard-digits mt-1 text-lg">{score ?? "—"}</p>
    </div>
  )
}

function PredictionStatusBadge({ status }: { status: PredictionStatus }) {
  if (status === "UP_TO_DATE") {
    return (
      <span className="rounded-full bg-pitch-600/10 px-3 py-1 text-xs font-medium text-pitch-800">
        À jour
      </span>
    )
  }

  if (status === "CONSENSUS_CHANGED") {
    return (
      <span className="rounded-full bg-gold-500/15 px-3 py-1 text-xs font-medium text-gold-500">
        Consensus modifié
      </span>
    )
  }

  return (
    <span className="rounded-full bg-cream-100 px-3 py-1 text-xs font-medium text-ink-600">
      Statut inconnu
    </span>
  )
}

export default async function RoundPage({ params }: PageProps) {
  const accessLevel = await getCurrentAccessLevel()

  if (accessLevel === "anonymous") {
    redirect("/login")
  }

  if (accessLevel === "user") {
    redirect("/")
  }

  const { round: roundParam } = await params

  const round = Number(roundParam)

  if (!Number.isInteger(round) || round <= 0) {
    notFound()
  }

  const matches = await getRoundMatches(round)

  const calculatedMatches = matches.filter(
    (match) =>
      getLatestPrediction(match.predictions as Prediction[] | null) !== null,
  ).length

  return (
    <main className="mx-auto max-w-6xl p-8">
      <header>
        <p className="text-sm font-medium text-ink-400">Ligue 1</p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink-900">
            Journée {round}
          </h1>

          {matches.length > 0 && (
            <p className="text-sm text-ink-400">
              {calculatedMatches}/{matches.length} prédictions disponibles
            </p>
          )}
        </div>

        <div className="pitch-divider mt-4" />
      </header>

      {matches.length === 0 ? (
        <section className="mt-10 rounded-xl border border-line bg-white p-8">
          <p className="text-ink-600">
            Aucun match enregistré pour cette journée.
          </p>
        </section>
      ) : (
        <section className="mt-8 grid gap-4">
          {matches.map((match) => {
            const homeTeam = getSingleTeam(match.home_team)
            const awayTeam = getSingleTeam(match.away_team)

            if (!homeTeam || !awayTeam) {
              return null
            }

            const predictions = match.predictions as Prediction[] | null
            const snapshots = match.odds_snapshots as OddsSnapshot[] | null
            const prediction = getLatestPrediction(predictions)
            const bookmakerCount = getRawBookmakerCount(snapshots)
            const latestRawOddsAt = getLatestRawOddsAt(snapshots)

            const predictionStatus = prediction
              ? getPredictionStatus(prediction, snapshots)
              : null

            return (
              <Link
                key={match.id}
                href={`/match/${match.id}`}
                className="block rounded-xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-pitch-500 hover:shadow-md"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-ink-400">
                        {formatKickoff(match.kickoff_at)}
                      </p>

                      <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900">
                        {homeTeam.short_name ?? homeTeam.name}
                        {" — "}
                        {awayTeam.short_name ?? awayTeam.name}
                      </h2>

                      {match.status === "FINISHED" &&
                        match.home_goals !== null &&
                        match.away_goals !== null && (
                          <p className="mt-2 text-sm font-medium text-pitch-800">
                            Résultat : {match.home_goals}-{match.away_goals}
                          </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {prediction ? (
                        <span className="rounded-full bg-pitch-600 px-3 py-1 text-xs font-medium text-cream-50">
                          Calculé
                        </span>
                      ) : (
                        <span className="rounded-full bg-cream-100 px-3 py-1 text-xs font-medium text-ink-600">
                          En attente
                        </span>
                      )}

                      {predictionStatus && (
                        <PredictionStatusBadge status={predictionStatus} />
                      )}

                      <span className="rounded-full bg-cream-100 px-3 py-1 text-xs text-ink-600">
                        {bookmakerCount} bookmaker
                        {bookmakerCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {prediction ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <PredictionScore
                          label="Leader"
                          score={prediction.leader_score}
                        />

                        <PredictionScore
                          label="Équilibré"
                          score={prediction.balanced_score}
                        />
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-400">
                        <p>
                          Prédiction {formatFreshness(prediction.calculated_at)}
                        </p>

                        <p>
                          Consensus utilisé{" "}
                          {formatFreshness(prediction.cutoff_at)}
                        </p>

                        {latestRawOddsAt && (
                          <p>
                            Dernières cotes {formatFreshness(latestRawOddsAt)}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg bg-cream-100 p-4">
                      <p className="text-sm text-ink-600">
                        La prédiction sera disponible dès que suffisamment de
                        données bookmaker auront été synchronisées.
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </section>
      )}
    </main>
  )
}
