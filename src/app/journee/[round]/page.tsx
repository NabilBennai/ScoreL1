import Link from "next/link"
import { notFound } from "next/navigation"
import { getRoundMatches } from "@/lib/data/repositories/round-repository"

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

type Prediction = {
  id: string
  calculated_at: string
  cutoff_at: string
  leader_score: string | null
  balanced_score: string | null
  challenger_score: string | null
}

type OddsSnapshot = {
  bookmaker: string | null
  captured_at: string
  provider: string
}

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

function getRawBookmakerCount(snapshots: OddsSnapshot[] | null): number {
  const bookmakers = new Set(
    getRawBookmakerSnapshots(snapshots)
      .map((snapshot) => snapshot.bookmaker)
      .filter((bookmaker): bookmaker is string => bookmaker !== null),
  )

  return bookmakers.size
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

function hasNewerOddsThanPrediction(
  prediction: Prediction,
  latestRawOddsAt: string | null,
): boolean {
  if (!latestRawOddsAt) {
    return false
  }

  return (
    new Date(latestRawOddsAt).getTime() >
    new Date(prediction.cutoff_at).getTime()
  )
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
    <div className="rounded-lg bg-zinc-100 px-4 py-3 text-center">
      <p className="text-xs text-zinc-500">{label}</p>

      <p className="mt-1 text-lg font-bold">{score ?? "—"}</p>
    </div>
  )
}

export default async function RoundPage({ params }: PageProps) {
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
        <p className="text-sm font-medium text-zinc-500">Ligue 1</p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-3xl font-bold">Journée {round}</h1>

          {matches.length > 0 && (
            <p className="text-sm text-zinc-500">
              {calculatedMatches}/{matches.length} prédictions disponibles
            </p>
          )}
        </div>
      </header>

      {matches.length === 0 ? (
        <section className="mt-10 rounded-xl border p-8">
          <p className="text-zinc-600">
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

            const newerOddsAvailable = prediction
              ? hasNewerOddsThanPrediction(prediction, latestRawOddsAt)
              : false

            return (
              <Link
                key={match.id}
                href={`/match/${match.id}`}
                className="block rounded-xl border p-5 transition hover:bg-zinc-50"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-zinc-500">
                        {formatKickoff(match.kickoff_at)}
                      </p>

                      <h2 className="mt-2 text-xl font-semibold">
                        {homeTeam.short_name ?? homeTeam.name}
                        {" — "}
                        {awayTeam.short_name ?? awayTeam.name}
                      </h2>

                      {match.status === "FINISHED" &&
                        match.home_goals !== null &&
                        match.away_goals !== null && (
                          <p className="mt-2 text-sm font-medium">
                            Résultat : {match.home_goals}-{match.away_goals}
                          </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {prediction ? (
                        <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white">
                          Calculé
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                          En attente
                        </span>
                      )}

                      {newerOddsAvailable && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                          Cotes plus récentes
                        </span>
                      )}

                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                        {bookmakerCount} bookmaker
                        {bookmakerCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {prediction ? (
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        <PredictionScore
                          label="Leader"
                          score={prediction.leader_score}
                        />

                        <PredictionScore
                          label="Équilibré"
                          score={prediction.balanced_score}
                        />

                        <PredictionScore
                          label="Challenger"
                          score={prediction.challenger_score}
                        />
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-500">
                        <p>
                          Prédiction {formatFreshness(prediction.calculated_at)}
                        </p>

                        <p>Consensus {formatFreshness(prediction.cutoff_at)}</p>

                        {latestRawOddsAt && (
                          <p>
                            Dernières cotes {formatFreshness(latestRawOddsAt)}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg bg-zinc-50 p-4">
                      <p className="text-sm text-zinc-500">
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
