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

type ExpectedValue = {
  home: number
  away: number
  probability: number
  crowdShare: number
  conditionalCrowdShare: number
  rarityBonus: number
  expectedPoints: number
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)} %`
}

function findExpectedValue(values: ExpectedValue[], score: string | null) {
  if (!score) {
    return null
  }

  const [home, away] = score.split("-").map(Number)

  return (
    values.find((value) => value.home === home && value.away === away) ?? null
  )
}

function StrategyCard({
  title,
  score,
  value,
}: {
  title: string
  score: string | null
  value: ExpectedValue | null
}) {
  return (
    <div className="rounded-xl border p-5">
      <p className="text-sm font-medium text-zinc-500">{title}</p>

      <p className="mt-3 text-4xl font-bold">{score ?? "—"}</p>

      {value && (
        <div className="mt-4 space-y-1 text-sm text-zinc-600">
          <p>Probabilité : {formatPercent(value.probability)}</p>

          <p>Peloton estimé : {formatPercent(value.crowdShare)}</p>

          <p>
            Part conditionnelle : {formatPercent(value.conditionalCrowdShare)}
          </p>

          <p>Bonus rareté : +{value.rarityBonus}</p>

          <p className="font-medium text-zinc-900">
            EV : {value.expectedPoints.toFixed(2)} pts
          </p>
        </div>
      )}
    </div>
  )
}

export default async function MatchPage({ params }: PageProps) {
  const { matchId } = await params

  const prediction = await getLatestPredictionForMatch(matchId)

  if (!prediction) {
    notFound()
  }

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

  const scores = prediction.score_probabilities as ScoreProbability[]

  const expectedValues = (prediction.expected_points ?? []) as ExpectedValue[]

  const topScores = [...scores]
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 10)

  const leaderValue = findExpectedValue(expectedValues, prediction.leader_score)

  const balancedValue = findExpectedValue(
    expectedValues,
    prediction.balanced_score,
  )

  const challengerValue = findExpectedValue(
    expectedValues,
    prediction.challenger_score,
  )

  return (
    <main className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <p className="text-sm text-zinc-500">Journée {match.round}</p>

        <h1 className="mt-2 text-3xl font-bold">
          {homeTeam.short_name ?? homeTeam.name}
          {" — "}
          {awayTeam.short_name ?? awayTeam.name}
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
        <h2 className="text-xl font-semibold">Stratégies MPP</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <StrategyCard
            title="Leader"
            score={prediction.leader_score}
            value={leaderValue}
          />

          <StrategyCard
            title="Équilibré"
            score={prediction.balanced_score}
            value={balancedValue}
          />

          <StrategyCard
            title="Challenger"
            score={prediction.challenger_score}
            value={challengerValue}
          />
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
