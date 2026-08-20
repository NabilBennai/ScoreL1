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
  description,
  score,
  value,
}: {
  title: string
  description: string
  score: string | null
  value: ExpectedValue | null
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-pitch-600">
        {title}
      </p>

      <div className="mt-3 inline-flex rounded-xl bg-ink-900 px-6 py-3">
        <p className="scoreboard-digits text-4xl">{score ?? "—"}</p>
      </div>

      <p className="mt-3 text-sm text-ink-600">{description}</p>

      {value && (
        <div className="mt-4 space-y-1 text-sm text-ink-600">
          <p>Probabilité : {formatPercent(value.probability)}</p>

          <p>Peloton estimé : {formatPercent(value.crowdShare)}</p>

          <p>
            Part conditionnelle : {formatPercent(value.conditionalCrowdShare)}
          </p>

          <p>Bonus rareté : +{value.rarityBonus}</p>

          <p className="font-medium text-ink-900">
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

  return (
    <main className="mx-auto max-w-6xl p-8">
      <header className="mb-8 rounded-2xl border border-line bg-white p-6">
        <p className="text-sm text-ink-400">Journée {match.round}</p>

        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink-900">
          {homeTeam.short_name ?? homeTeam.name}
          {" — "}
          {awayTeam.short_name ?? awayTeam.name}
        </h1>

        <p className="mt-2 text-sm text-ink-400">
          {new Date(match.kickoff_at).toLocaleString("fr-FR")}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-line bg-white p-5">
          <p className="text-sm text-ink-400">λ domicile</p>

          <p className="mt-2 font-display text-3xl font-semibold text-ink-900">
            {Number(prediction.lambda_home).toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border border-line bg-white p-5">
          <p className="text-sm text-ink-400">λ extérieur</p>

          <p className="mt-2 font-display text-3xl font-semibold text-ink-900">
            {Number(prediction.lambda_away).toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border border-line bg-white p-5">
          <p className="text-sm text-ink-400">Fit marché</p>

          <p className="mt-2 font-display text-3xl font-semibold text-ink-900">
            {Number(prediction.market_fit_loss).toFixed(4)}
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold text-ink-900">
          Pronostics recommandés
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <StrategyCard
            title="Leader"
            description="Priorité au score exact le plus probable."
            score={prediction.leader_score}
            value={leaderValue}
          />

          <StrategyCard
            title="Équilibré"
            description="Compromis entre fiabilité du résultat et potentiel MPP."
            score={prediction.balanced_score}
            value={balancedValue}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold text-ink-900">
          Scores les plus probables
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {topScores.map((score) => (
            <div
              key={`${score.home}-${score.away}`}
              className="scoreboard-chip"
            >
              <p className="scoreboard-digits text-2xl">
                {score.home}-{score.away}
              </p>

              <p className="mt-1 text-sm text-cream-100/70">
                {formatPercent(score.probability)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-10 text-sm text-ink-400">
        Calculé le {new Date(prediction.calculated_at).toLocaleString("fr-FR")}
      </footer>
    </main>
  )
}
