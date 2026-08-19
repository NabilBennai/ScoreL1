import { notFound } from "next/navigation"
import { getLatestPredictionForMatch } from "@/lib/data/repositories/match-prediction-repository"

type PageProps = {
  params: Promise<{
    matchId: string
  }>
}

type ScoreProbability = {
  home: number
  away: number
  probability: number
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)} %`
}

export default async function MatchPage({ params }: PageProps) {
  const { matchId } = await params

  const prediction = await getLatestPredictionForMatch(matchId)

  if (!prediction) {
    notFound()
  }

  const scores = prediction.score_probabilities as ScoreProbability[]

  const topScores = [...scores]
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 10)

  const match = Array.isArray(prediction.matches)
    ? prediction.matches[0]
    : prediction.matches

  if (!match) {
    notFound()
  }

  const homeTeam = Array.isArray(match.home_team)
    ? match.home_team[0]
    : match.home_team

  const awayTeam = Array.isArray(match.away_team)
    ? match.away_team[0]
    : match.away_team

  if (!homeTeam || !awayTeam) {
    notFound()
  }
  return (
    <main className="mx-auto max-w-5xl p-8">
      <header className="mb-8">
        <p className="text-sm text-zinc-500">Journée {match.round}</p>

        <h1 className="mt-2 text-3xl font-bold">
          {homeTeam.short_name ?? homeTeam.name}
          {" — "}
          {awayTeam.short_name ?? awayTeam.name}{" "}
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          {new Date(match.kickoff_at).toLocaleString("fr-FR")}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-zinc-500">λ domicile</p>

          <p className="mt-2 text-3xl font-semibold">
            {Number(prediction.lambda_home).toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-zinc-500">λ extérieur</p>

          <p className="mt-2 text-3xl font-semibold">
            {Number(prediction.lambda_away).toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-zinc-500">Fit marché</p>

          <p className="mt-2 text-3xl font-semibold">
            {Number(prediction.market_fit_loss).toFixed(4)}
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Scores les plus probables</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {topScores.map((score) => (
            <div
              key={`${score.home}-${score.away}`}
              className="rounded-xl border p-4"
            >
              <p className="text-2xl font-bold">
                {score.home}-{score.away}
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                {formatPercent(score.probability)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-10 text-sm text-zinc-500">
        Calculé le {new Date(prediction.calculated_at).toLocaleString("fr-FR")}
      </footer>
    </main>
  )
}
