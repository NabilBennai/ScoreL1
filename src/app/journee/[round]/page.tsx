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
  leader_score: string | null
  balanced_score: string | null
  challenger_score: string | null
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

export default async function RoundPage({ params }: PageProps) {
  const { round: roundParam } = await params

  const round = Number(roundParam)

  if (!Number.isInteger(round) || round <= 0) {
    notFound()
  }

  const matches = await getRoundMatches(round)

  return (
    <main className="mx-auto max-w-6xl p-8">
      <header>
        <p className="text-sm font-medium text-zinc-500">Ligue 1</p>

        <h1 className="mt-2 text-3xl font-bold">Journée {round}</h1>
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

            const prediction = getLatestPrediction(match.predictions)

            return (
              <Link
                key={match.id}
                href={`/match/${match.id}`}
                className="block rounded-xl border p-5 transition hover:bg-zinc-50"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">
                      {new Date(match.kickoff_at).toLocaleString("fr-FR")}
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

                  {prediction ? (
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-lg bg-zinc-100 px-4 py-3">
                        <p className="text-xs text-zinc-500">Leader</p>

                        <p className="mt-1 text-lg font-bold">
                          {prediction.leader_score ?? "—"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-zinc-100 px-4 py-3">
                        <p className="text-xs text-zinc-500">Équilibré</p>

                        <p className="mt-1 text-lg font-bold">
                          {prediction.balanced_score ?? "—"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-zinc-100 px-4 py-3">
                        <p className="text-xs text-zinc-500">Challenger</p>

                        <p className="mt-1 text-lg font-bold">
                          {prediction.challenger_score ?? "—"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">Aucune prédiction</p>
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
